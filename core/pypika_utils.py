from pypika import analytics as an, functions as pypika_fn
from pypika import Table, PostgreSQLQuery as Query
import core.const as const
import re
import json
import operator
from functools import reduce


def text_search(field, search_ilike):
    if "|" in search_ilike:  # User is trying to search for multiple strings
        search_ilikes = search_ilike.split("|")
        text_searches = [text_search(field, search_ilike_child) for search_ilike_child in search_ilikes]
        return reduce(operator.or_, text_searches)
    elif "&" in search_ilike:
        search_ilikes = search_ilike.split("&")
        text_searches = [text_search(field, search_ilike_child) for search_ilike_child in search_ilikes]
        return reduce(operator.and_, text_searches)
    return field.ilike(search_ilike)


def concat(field, args):
    return pypika_fn.Concat(getattr(field, 'name'), args)


# Won't be needed in Python 3.8 Import from math module instead
def prod(iterable):
    return reduce(operator.mul, iterable, 1)


class QueryBuilder:

    def __init__(self, operation=None):

        self.limit_regex = re.compile('LIMIT \d+', re.IGNORECASE)

        query_steps = operation.operationstep_set

        self.current_dataset = Table(query_steps.first().source.active_mirror_name, schema=query_steps.first().source.schema)
        self.current_query = Query.from_(self.current_dataset)

        for query_step in query_steps.all():
            query_func = getattr(self, query_step.query_func)
            kwargs = query_step.query_kwargs
            if isinstance(kwargs, type(None)):
                self = query_func()
            else:
                query_kwargs_json = json.loads(kwargs)
                self = query_func(**query_kwargs_json)

    def aggregate(self, group_by, agg_func_name, operational_column):
        self.current_query = Query.from_(self.current_dataset)

        agg_func = getattr(pypika_fn, agg_func_name)  # https://pypika.readthedocs.io/en/latest/api/pypika.functions.html e.g. Sum, Count, Avg
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

        self.current_query = Query.from_(self.current_dataset)
        tmp_query = ''
        window_ = getattr(an, window_fn)
        # Check if additional **kwargs are required in for given window function
        if window_fn == 'DenseRank' or window_fn == 'Rank' or window_fn == 'RowNumber':
            tmp_query = window_()
        else:
            tmp_query = window_(term=getattr(self.current_dataset, term), **kwargs)

        if over:
            for over_elem in over:
                tmp_query = tmp_query.over(getattr(self.current_dataset, over_elem))

        if order_by:
            for order in order_by:
                tmp_query = tmp_query.orderby(getattr(self.current_dataset, order))

        if columns:
            self.current_query = self.current_query.select(*[getattr(self.current_dataset, col_elem) for col_elem in columns], tmp_query)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star, tmp_query)

        self.current_dataset = self.current_query
        return self

    def filter(self, filters):
        self.current_query = Query.from_(self.current_dataset)

        filter_mapping = {
            "lt": operator.lt,
            "le": operator.le,
            "eq": operator.eq,
            "ne": operator.ne,
            "ge": operator.ge,
            "gt": operator.gt,
            "text_search": text_search
        }
        filter_operations = [filter_mapping[filter["func"]](getattr(self.current_dataset, filter["field"]), filter["value"]) for filter in filters]
        filter_operations_or = reduce(operator.or_, filter_operations)
        self.current_query = self.current_query.select(self.current_dataset.star).where(filter_operations_or)

        self.current_dataset = self.current_query
        return self

    def multi_transform(self, trans_func_name, operational_columns):
        if not isinstance(operational_columns, list):
            raise ValueError("Expecting a list of operational columns")

        self.current_query = Query.from_(self.current_dataset)
        multi_transform_mapping = {
            "sum": sum,
            "product": prod
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
            self.current_dataset.star, trans_func(getattr(self.current_dataset, operational_column), operational_value).as_(operational_alias)
        )

        self.current_dataset = self.current_query
        return self

    def join(self, table_name, schema_name, join_on, criterion=None, columns=None):
        self.current_query = Query.from_(self.current_dataset)
        table1 = self.current_dataset
        table2 = Table(table_name, schema=schema_name)
        table1_columns = [table1.star]
        table2_columns = [table2.star]

        if columns:
            table1_columns = map(lambda x: getattr(table1, x), columns.get('table1'))
            table2_columns = map(lambda x: getattr(table2, x), columns.get('table2'))

        q = self.current_query.join(table2).on_field(*join_on).select(
            *table1_columns, *table2_columns
        )

        # if criterion:

        self.current_query = q
        self.current_dataset = self.current_query
        return self

    def select(self, columns=None, groupby=None):
        self.current_query = Query.from_(self.current_dataset)
        if columns:
            self.current_query = self.current_query.select(*columns)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star)
        self.current_dataset = self.current_query
        return self

    def count_sql(self):
        self.current_query = Query.from_(self.current_dataset)
        return self.current_query.select(pypika_fn.Count(self.current_dataset.star)).get_sql()

    def get_sql(self, limit=const.default_limit_count, offset=0):
        if limit == 0:
            limit = "0"  # Pypika refused to allow limit 0 unless it's a string...
        final_query = self.current_query.get_sql()
        if self.limit_regex.match(final_query):
            return final_query
        else:
            return self.current_query.limit(limit).offset(offset).get_sql()

    def get_sql_without_limit(self):
        return self.current_query.get_sql()
