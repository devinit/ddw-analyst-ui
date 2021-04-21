"""
    Holds functions and classes that utilise pypika (https://pypika.readthedocs.io) to generate
    SQL queries
"""
import json
import operator
import re
from functools import reduce
from operator import itemgetter

from pypika import PostgreSQLQuery as Query
from pypika import Table
from pypika import analytics as an
from pypika import functions as pypika_fn
from pypika import JoinType
from pypika.terms import PseudoColumn
from pypika.terms import Function
from pypika.terms import Field

from core.const import DEFAULT_LIMIT_COUNT
from core.models import Source, Operation


class NullIf(Function):
    def __init__(self, term, condition, **kwargs):
        super(NullIf, self).__init__('NULLIF', term, condition, **kwargs)

class PsqlExists(Function):
    def __init__(self, sub_query, negate=False, is_aggregate=True):
        super(PsqlExists, self).__init__('NOT EXISTS', sub_query, is_aggregate=is_aggregate) if negate else super(PsqlExists, self).__init__('EXISTS', sub_query, is_aggregate=is_aggregate)

def text_search(field, search_ilike):
    if "|" in search_ilike:  # User is trying to search for multiple strings
        search_ilikes = search_ilike.split("|")
        text_searches = [text_search(field, search_ilike_child) for search_ilike_child in search_ilikes]
        return reduce(operator.or_, text_searches)
    if "&" in search_ilike:
        search_ilikes = search_ilike.split("&")
        text_searches = [text_search(field, search_ilike_child) for search_ilike_child in search_ilikes]
        return reduce(operator.and_, text_searches)
    return field.ilike(search_ilike)

def is_in(field, values):
    return field.isin(values)

FILTER_MAPPING = {
    "lt": operator.lt,
    "le": operator.le,
    "eq": operator.eq,
    "ne": operator.ne,
    "ge": operator.ge,
    "gt": operator.gt,
    "text_search": text_search,
    "is_in": is_in
}


def concat(field, args):
    return pypika_fn.Concat(field, args)


def multi_concat(iterable):
    return reduce(pypika_fn.Concat, iterable)


def multi_divide(iterable):
    iterable_nullif = [iterable[0]]
    if len(iterable) > 1:
        for iter in iterable[1:]:
            iterable_nullif.append(NullIf(iter, 0))
    return reduce(operator.truediv, iterable_nullif)


def multi_subtract(iterable):
    return reduce(operator.sub, iterable)


# Won't be needed in Python 3.8 Import from math module instead
def prod(iterable):
    return reduce(operator.mul, iterable, 1)

def filter_selects(query_step):
    query_func = None
    try:
        query_func = query_step.query_func
    except TypeError:
        query_func = query_step['query_func']
    if query_func == 'select':
        return True
    else:
        return False

def filter_joins(query_step):
    query_func = None
    try:
        query_func = query_step.query_func
    except TypeError:
        query_func = query_step['query_func']
    if query_func == 'join':
        return True
    else:
        return False

def filter_filters(query_step):
    query_func = None
    try:
        query_func = query_step.query_func
    except TypeError:
        query_func = query_step['query_func']
    if query_func == 'filter':
        return True
    else:
        return False

def filter_others(query_step):
    query_func = None
    try:
        query_func = query_step.query_func
    except TypeError:
        query_func = query_step['query_func']
    if query_func != 'select' and query_func != 'filter' and query_func != 'join':
        return True
    else:
        return False

class QueryBuilder:

    def __init__(self, operation=None, operation_steps=None, source=None):

        self.limit_regex = re.compile('LIMIT \d+', re.IGNORECASE)
        self.selected = False
        self.aggregated = False
        self.filtered = False
        self.joined = False

        if operation_steps:
            query_steps = sorted(operation_steps, key=itemgetter('step_id'))
            current_source = Source.objects.get(pk=query_steps[0]['source'])
            self.initial_table_name = current_source.active_mirror_name
            self.initial_schema_name = current_source.schema
        else:
            query_steps = operation.operationstep_set.order_by('step_id').all()
            self.initial_table_name = query_steps.first().source.active_mirror_name
            self.initial_schema_name = query_steps.first().source.schema

        self.current_dataset = Table(self.initial_table_name, schema=self.initial_schema_name)
        self.current_query = Query.from_(self.current_dataset)

        select_steps = filter(filter_selects, query_steps)
        self.execute(select_steps, operation_steps)
        join_steps = filter(filter_joins, query_steps)
        self.execute(join_steps, operation_steps)
        if self.joined:
            self.current_dataset = self.current_query
        filter_steps = filter(filter_filters, query_steps)
        self.execute(filter_steps, operation_steps)
        if self.filtered:
            self.current_dataset = self.current_query
        other_steps = filter(filter_others, query_steps)
        self.execute(other_steps, operation_steps)

    def execute(self, query_steps, operation_steps=None):
        for query_step in query_steps:
            if operation_steps:
                query_func = getattr(self, query_step['query_func'])
                kwargs = query_step['query_kwargs']
            else:
                query_func = getattr(self, query_step.query_func)
                kwargs = query_step.query_kwargs
            if isinstance(kwargs, type(None)):
                self = query_func()
            else:
                query_kwargs_json = json.loads(kwargs)
                if query_step.query_func == 'filter':
                    self = query_func(source=query_step.source, **query_kwargs_json)
                else:
                    self = query_func(**query_kwargs_json)


    def aggregate(self, group_by, agg_func_name, operational_column):
        self.aggregated = True
        self.current_query = Query.from_(self.current_dataset)

        # https://pypika.readthedocs.io/en/latest/api/pypika.functions.html e.g. Sum, Count, Avg
        agg_func = getattr(pypika_fn, agg_func_name)
        group_by = [getattr(self.current_dataset, col) for col in group_by]
        select_by = group_by.copy()
        current_operational_column = getattr(self.current_dataset, operational_column)

        operational_alias = "_".join([operational_column, agg_func_name])

        select_by.append(agg_func(current_operational_column, alias=operational_alias))

        self.select(select_by)
        self.current_query = self.current_query.groupby(*group_by)
        self.current_dataset = self.current_query
        return self

    def window(self, window_fn, term=None, over=None, order_by=None, columns=None, **kwargs):

        self.aggregated = True
        self.current_query = Query.from_(self.current_dataset)
        tmp_query = ''
        window_ = getattr(an, window_fn)
        argumentless_analytics = ['DenseRank', 'Rank', 'RowNumber']
        positional_arg_analytics = ['FirstValue', 'LastValue']
        term_analytics = [
            'NTile', 'Median', 'Avg', 'StdDev', 'StdDevPop', 'StdDevSamp',
            'Variance', 'VarPop', 'VarSamp', 'Count', 'Sum', 'Max', 'Min'
        ]
        if window_fn in argumentless_analytics:
            tmp_query = window_()
        elif window_fn in positional_arg_analytics:  # Only uses first positional arg. Cannot use `term=`
            tmp_query = window_(getattr(self.current_dataset, term))
        elif window_fn in term_analytics:
            try:
                tmp_query = window_(term=getattr(self.current_dataset, term), **kwargs)
            except TypeError:  # Term is an integer, like with NTile
                tmp_query = window_(term=term, **kwargs)
        else:
            raise Exception(
                'window_fn was not found in predefined window functions.')

        if over:
            for over_elem in over:
                tmp_query = tmp_query.over(getattr(self.current_dataset, over_elem))

        if order_by:
            for order in order_by:
                tmp_query = tmp_query.orderby(getattr(self.current_dataset, order))

        if columns:
            self.current_query = self.current_query.select(
                *[getattr(self.current_dataset, col_elem) for col_elem in columns], tmp_query)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star, tmp_query)

        self.current_dataset = self.current_query
        return self

    def filter(self, filters, source=None):
        if self.joined:
            table = self.previous_dataset
        elif source is None:
            table = self.current_dataset
        else:
            table = Table(source.active_mirror_name)
        filter_operations = [FILTER_MAPPING[filter["func"]](getattr(
            table, filter["field"]), filter["value"]) for filter in filters]
        filter_operations_or = reduce(operator.or_, filter_operations)
        if self.selected:
            self.current_query = self.current_query.where(filter_operations_or)
        else:
            if self.check_dataset_equals_query():
                self.current_query = Query.from_(self.current_dataset)
            self.current_query = self.current_query.select(self.current_dataset.star).where(filter_operations_or)
            self.selected = True
        self.filtered = True
        return self

    def multi_transform(self, trans_func_name, operational_columns):
        self.aggregated = True
        if not isinstance(operational_columns, list):
            raise ValueError("Expecting a list of operational columns")

        self.current_query = Query.from_(self.current_dataset)
        multi_transform_mapping = {
            "sum": sum,
            "product": prod,
            "concat": multi_concat,
            "divide": multi_divide,
            "subtract": multi_subtract
        }
        trans_func = multi_transform_mapping[trans_func_name]
        operational_alias = "_".join([operational_columns[0], trans_func_name])
        select_by = [getattr(self.current_dataset, operational_column) for operational_column in operational_columns]
        self.current_query = self.current_query.select(
            self.current_dataset.star, trans_func(select_by).as_(operational_alias)
        )

        self.current_dataset = self.current_query
        return self

    def scalar_transform(self, trans_func_name, operational_column, operational_value):
        self.aggregated = True
        self.current_query = Query.from_(self.current_dataset)
        scalar_transform_mapping = {
            "add": operator.add,
            "multiply": operator.mul,
            "power": operator.pow,
            "subtract": operator.sub,
            "divide": operator.truediv,
            "concat": concat,
            "text_search": text_search
        }
        trans_func = scalar_transform_mapping[trans_func_name]
        operational_alias = "_".join([operational_column, trans_func_name])
        self.current_query = self.current_query.select(
            self.current_dataset.star, trans_func(getattr(
                self.current_dataset, operational_column), operational_value).as_(operational_alias)
        )

        self.current_dataset = self.current_query
        return self

    def join(self, table_name, schema_name, join_on, join_how="full", columns_x=None, columns_y=None, suffix_y="2"):
        self.selected = True
        self.joined = True
        self.current_query = Query.from_(self.current_dataset)

        join_how_mapping = {
            "inner": JoinType.inner,
            "left": JoinType.left,
            "right": JoinType.right,
            "outer": JoinType.outer,
            "left_outer": JoinType.left_outer,
            "right_outer": JoinType.right_outer,
            "full": JoinType.full_outer,
            "cross": JoinType.cross
        }
        join_how_value = join_how_mapping[join_how]
        table1 = self.current_dataset
        table2 = Table(table_name, schema=schema_name)
        if columns_x and columns_y:
            joined_table1_columns = [join_on_item[0] for join_on_item in join_on.items()]
            joined_table2_columns = [join_on_item[1] for join_on_item in join_on.items()]
            unjoined_table1_columns = [col for col in columns_x if col not in joined_table1_columns]
            unjoined_table2_columns = [col for col in columns_y if col not in joined_table2_columns]
            common_unjoined_columns = list(set(unjoined_table1_columns) & set(unjoined_table2_columns))
            uncommon_table2_unjoined_columns = [getattr(
                table2, col) for col in unjoined_table2_columns if col not in common_unjoined_columns]

            select_on = [table1.star]  # All of the columns from table1
            # And all of the unjoined, unaliased unique columns from Table2
            select_on += uncommon_table2_unjoined_columns
            # And all of the unjoined, aliased common columns from 2
            select_on += [getattr(table2, col).as_("{}_{}".format(col, suffix_y)) for col in common_unjoined_columns]
        else:
            select_on = [table1.star] + [table2.star]

        self.current_query = self.current_query.join(table2, how=join_how_value).on(
            reduce(operator.and_, [operator.eq(getattr(table1, k), getattr(table2, v)) for k, v in join_on.items()])
        ).select(
            *select_on
        )

        self.previous_dataset = self.current_dataset
        self.current_dataset = self.current_query
        return self

    def generate_sub_query_as_column(self, sub_query_id):
        operation = Operation.objects.get(pk=int(sub_query_id))
        sub_query = QueryBuilder(operation=operation)
        return sub_query.current_query

    def select(self, columns=None, groupby=None):
        if not self.selected and not self.check_dataset_equals_query():
            self.current_query = Query.from_(self.current_dataset)

        if columns:
            for col_index in range(len(columns)):
                # If column value is numeric, then that's a sub-query
                if str(columns[col_index]).isnumeric():
                    columns[col_index] = self.generate_sub_query_as_column(columns[col_index])

            self.current_query = self.current_query.select(*columns)
            self.number_of_columns = len(columns)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star)
            self.number_of_columns = 0 # Means all columns selected, and we shall not use it in subqueries

        self.selected = True

        if self.aggregated or self.filtered:
            self.current_dataset = self.current_query

        return self

    def count_sql(self, estimate=True):
        if estimate:
            stats_table = Table("pg_stat_user_tables")
            return Query.from_(stats_table).select(stats_table.n_live_tup).where(stats_table.relname == self.initial_table_name).where(stats_table.schemaname == self.initial_schema_name).get_sql()
        self.current_query = Query.from_(self.current_dataset)
        return self.current_query.select(pypika_fn.Count(self.current_dataset.star)).get_sql()

    def get_sql(self, limit=DEFAULT_LIMIT_COUNT, offset=0):
        if limit == 0:
            # Pypika refused to allow limit 0 unless it's a string...
            limit = "0"
        final_query = self.current_query.get_sql()
        if self.limit_regex.match(final_query):
            return final_query
        else:
            return self.current_query.limit(limit).offset(offset).get_sql()

    def get_sql_without_limit(self):
        return self.current_query.get_sql()

    def filter_across_tables(self, filters):
        left_source = Source.objects.get(pk=filters[0]['left_source'])
        left_column_name = filters[0]["left_field"]
        right_source = Source.objects.get(pk=filters[0]['right_source'])
        right_column_name = filters[0]["right_field"]
        left_table = Table(left_source.active_mirror_name, left_source.schema)
        right_table = Table(right_source.active_mirror_name, right_source.schema)
        left_hand_field = Field(left_column_name, table=left_table)
        left_sql = left_hand_field.get_sql(with_namespace=True)
        right_hand_field = Field(right_column_name, table=right_table)
        right_sql = right_hand_field.get_sql(with_namespace=True)
        filter_op = FILTER_MAPPING[filters[0]["func"]]
        return filter_op(left_hand_field, right_hand_field)


    def select_sub_query(self, filters):
        self.current_query = self.current_query.where(self.filter_across_tables(filters))
        return self

    def exists(self, filters, negate=False):
        pseudo = PseudoColumn("1")
        left_source = Source.objects.get(pk=filters[0]['left_source'])
        left_table = Table(left_source.active_mirror_name, left_source.schema)
        sub_query = Query.from_(left_table).select(pseudo).where(self.filter_across_tables(filters))
        self.current_query = self.current_query.where(PsqlExists(sub_query, negate=negate))
        return self

    def notexists(self, filters, negate=True):
        return self.exists(filters, negate)


    def operator_or_where_clause_sub_query(self, filters):
        query_two = QueryBuilder(operation=Operation.objects.get(pk=filters[0]["value"]))
        sql_func = filters[0]["func"]
        table_field = filters[0]["field"]
        # UNION, IN
        if sql_func == "UNION":
            query_one = QueryBuilder(operation=Operation.objects.get(pk=table_field)).current_query if str(table_field).isnumeric() else self.current_query
            self.current_query = (query_one + query_two.current_query)
        elif sql_func == "IN" and query_two.number_of_columns == 1:
            self.current_query = self.current_query.where(getattr(self.current_dataset, table_field).isin(query_two.current_query))
        elif sql_func == "NOTIN" and query_two.number_of_columns == 1:
            self.current_query = self.current_query.where(getattr(self.current_dataset, table_field).isin(query_two.current_query).negate())
        elif(sql_func in FILTER_MAPPING.keys()):
            filter_op = FILTER_MAPPING[sql_func]
            self.current_query = self.current_query.where(filter_op(getattr(self.current_dataset, table_field), query_two.current_query))

        return self

    def check_dataset_equals_query(self):
        return self.current_query == self.current_dataset
