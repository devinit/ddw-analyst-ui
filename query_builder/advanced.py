
# from data.db_manager import run_query
import operator
from pypika.enums import JoinType
from pypika.queries import Query, Table
from pypika import Criterion
from pypika import functions as fn
from pypika import Order

from core.models import Source, SourceColumnMap
from core.const import DEFAULT_LIMIT_COUNT
from core.pypika_utils import text_search

FILTER_MAPPING = {
    '$lt': operator.lt,
    '$le': operator.le,
    '$eq': operator.eq,
    '$neq': operator.ne,
    '$gt': operator.gt,
    '$gte': operator.ge,
    '$text_search': text_search,
}

JOIN_MAPPING = {
    'left': JoinType.left,
    'right': JoinType.right,
    'inner': JoinType.inner,
    'outer': JoinType.outer,
    'left_outer': JoinType.left_outer,
    'right_outer': JoinType.right_outer,
    'full': JoinType.full_outer,
    'cross': JoinType.cross
}

FUNCTION_MAPPING = {
    'SUM': fn.Sum,
    'MAX': fn.Max,
    'MIN': fn.Min,
    'AVG': fn.Avg,
    'STD': fn.StdDev
    # TODO: add more functions
}

ORDERBY_MAPPING = {
    'ASC': Order.asc,
    'DESC': Order.desc
}

class AdvancedQueryBuilder:
    def __init__(self, operation=None):
        self.andKey = '$and'
        self.orKey = '$or'

    def process_config(self, config):
        self.config = config
        table = self.get_source_table(config.get('source'))
        query = Query.from_(table)

        if 'join' in config:
            join_query = self.handle_join(table, query, config)

            return join_query

        if 'filter' in config:
            filter_query = self.handle_filter(table, query, config)

            return filter_query

        if 'columns' in config or 'selectall' in config:
            select_query = self.get_select_query(table, query, config)

            return select_query

    def get_source_table(self, source_id, as_array=False):
        source = Source.objects.get(pk=source_id)

        table_name = source.active_mirror_name
        schema_name = source.schema

        if as_array:
            return [table_name, schema_name]

        return Table(table_name, schema=schema_name)

    def get_source_columns(self, source_id, exclude = []):
        source_columns = SourceColumnMap.objects.filter(source_id=source_id)
        columns = []
        for source_column in source_columns:
            if not source_column.name in exclude:
                columns.append({'id': source_column.id, 'name': source_column.name, 'alias':source_column.alias})
        return columns

    def handle_filter(self, table, query, config):
        filter_config = config.get('filter')
        if 'columns' in config and config.get('columns') or 'selectall' and config.get('selectall'):
            selectQuery = self.get_select_query(table, query, config)
            return self.get_filter_query(table, selectQuery, filter_config)

        return self.get_filter_query(table, query, filter_config)

    def handle_join(self, table, query, config):
        join_config = config.get('join')
        join_query = self.create_multiple_join_query(table, query, join_config, 0)

        if 'filter' in config:
            join_query = self.handle_filter(table, join_query, config)
            return join_query
        if 'columns' in config and config.get('columns') or 'selectall' and config.get('selectall'):
            join_query = self.get_select_query(table, join_query, config)

        return join_query

    def create_multiple_join_query(self, table, query, join_config, index):
        join_query = query
        if index < len(join_config):
            join_table = self.get_source_table(join_config[index].get('source'))
            join_mapping = join_config[index].get('mapping')
            
            if len(join_mapping) > 1:
                join_query = query.join(join_table, JOIN_MAPPING[join_config[index].get('type')]).on(operator.and_(*[
                    operator.eq(table[mapping[0]], join_table[mapping[1]]) for mapping in join_mapping
                ]))
            else:
                join_query = query.join(join_table, JOIN_MAPPING[join_config[index].get('type')]).on(*[
                    operator.eq(table[mapping[0]], join_table[mapping[1]]) for mapping in join_mapping
                ])
            return self.create_multiple_join_query(table, join_query, join_config, index + 1)
        else:
            return join_query

    def get_select_query(self, table, query, config):
        if config.get('selectall'):
            if 'groupby' in config or 'having' in config:
                raise LookupError('Columns must be explicitly SELECTED for queries that use GROUP BY clauses')
            else:
                columns = self.get_source_columns(config.get('source'))
                final_cols = self.process_select_columns(table, columns)
                return query.select(*final_cols)
        if 'columns' in config:
            if 'groupby' in config:
                query = self.get_groupby_query(table, query, config.get('groupby'), config.get('columns'), config)

            if 'selectall' in config and config.get('selectall'):
                # re-arrange columns starting by those in config first
                provided_cols = config.get('columns')
                other_columns = self.get_source_columns(config.get('source'), [column['name'] for column in provided_cols])
                for provided_col in provided_cols:
                    j = next((i for i, item in enumerate(other_columns) if item['name'] == provided_col['name']), False)
                    if j:
                        other_columns.pop(j)
                columns = provided_cols + other_columns
            else:
                columns = config.get('columns')

        # Handle select for joins
        if 'join' in config:
            # final_cols = self.append_join_columns(table, config, columns)
            logs = 2
            print(config)
            final_cols = self.process_select_columns(table, columns)
        else:
            final_cols = self.process_select_columns(table, columns)
            if 'join' in config:
                final_cols = self.append_join_columns(table, config, columns)
            else:
                final_cols = self.process_select_columns(table, columns)

            # also handles aggregations and aliases...
            query = query.select(*final_cols)

            if 'orderby' in config:
                orderby = config.get('orderby')
                return query.orderby(table[orderby[0]], order=ORDERBY_MAPPING[orderby[1]])
        else:
            raise LookupError('Columns must be explicitly SELECTED')

        return query

    def get_groupby_query(self, table, query, columns, select_columns, config):
        # Check if all columns in select are present in GROUP BY CLAUSE columns
        select_column_names = [elem['name'] for elem in select_columns]
        select_column_aggregates = []
        def get_column_aggregates():
            for elem in select_columns:
                if 'aggregate' in elem:
                    select_column_aggregates.append(elem)
        get_column_aggregates()

        if all(elem in columns for elem in select_column_names) or len(select_column_aggregates) > 0:
            query = query.groupby(*[table[column] for column in columns])
        else:
            raise ValueError('All columns (values) in the SELECT clause must be in the GROUP BY clause')
        if 'having' in config:
            query = self.get_having_query(table, query, config.get('having'))
        return query

    def get_filter_query(self, table, query, config):
        if self.andKey in config:
            rootConfig = config.get(self.andKey)
            # a way to handle complex filter configs
            crit = Criterion.all([ self.get_filter_criterion(table, config) for config in rootConfig ])
        elif self.orKey in config:
            rootConfig = config.get(self.orKey)
            # a way to handle complex filter configs
            crit = Criterion.any([ self.get_filter_criterion(table, config) for config in rootConfig ])

        # sample query
        return query.where(crit)

    def get_having_query(self, table, query, config):
        if self.andKey in config:
            rootConfig = config.get(self.andKey)
            # a way to handle complex having configs
            crit = Criterion.all([ self.get_having_criterion(table, config) for config in rootConfig ])
        elif self.orKey in config:
            rootConfig = config.get(self.orKey)
            # a way to handle complex having configs
            crit = Criterion.any([ self.get_having_criterion(table, config) for config in rootConfig ])


        # sample query
        return query.having(crit)

    def get_filter_criterion(self, table, filter):
        if self.andKey in filter:
            andConfig = filter.get(self.andKey)
            return Criterion.all([ self.get_filter_criterion(table, config) for config in andConfig ])

        if self.orKey in filter:
            orConfig = filter.get(self.orKey)
            return Criterion.any([ self.get_filter_criterion(table, config) for config in orConfig ])

        return FILTER_MAPPING[filter.get('comp')](table[filter.get('column')], filter.get('value'))

    def get_having_criterion(self, table, config):
        if self.andKey in config:
            andConfig = config.get(self.andKey)
            return Criterion.all([ self.get_having_criterion(table, config) for config in andConfig ])

        if self.orKey in config:
            orConfig = config.get(self.orKey)
            return Criterion.any([ self.get_having_criterion(table, config) for config in orConfig ])

        group_by_cols = self.config.get('groupby', {})
        value = config.get('value')
        plain = True
        if 'plain' in value:
            value = value.get('plain')
        else:
            value = FUNCTION_MAPPING[value.get('aggregate')](table[value.get('column')])
            plain = False
        if 'aggregate' in config:
            return FILTER_MAPPING[config.get('comp')](FUNCTION_MAPPING[config.get('aggregate')](table[config.get('column')]), value)
        elif group_by_cols and config.get('column') not in group_by_cols and plain:
            raise ValueError('Column {} must be in the GROUP BY clause'.format(config.get('column')))
        return FILTER_MAPPING[config.get('comp')](table[config.get('column')], value)

    def append_join_columns(self, table, config, columns):
        if 'join' in config:
            join_config = config.get('join')
            join_cols = join_config.get('columns')
            if join_cols:
                right_table = self.get_source_table(join_config.get('source'))
                right_cols = self.process_select_columns(right_table, join_cols)
                left_cols = self.process_select_columns(table, columns)

                return left_cols + right_cols
        return self.process_select_columns(table, columns)

    def process_select_columns(self, table, columns):
        return [FUNCTION_MAPPING[column.get('aggregate')](table[column.get('name')]).as_(column.get(
            'alias')) if 'aggregate' in column else table[column.get('name')].as_(column.get('alias')) for column in columns]

    def get_count_sql(self, config, estimate=True):
        if estimate:
            stats_table = Table("pg_stat_user_tables")
            table_parts = self.get_source_table(config.get('source'), True)
            table_name = table_parts[0]
            schema_name = table_parts[1]
            return Query.from_(stats_table).select(stats_table.n_live_tup).where(stats_table.relname == table_name).where(stats_table.schemaname == schema_name).get_sql()
        query = self.process_config(config)
        query = Query.from_(query)
        return query.select(fn.Count('*')).get_sql()

    def get_sql_with_limit(self, query, limit=DEFAULT_LIMIT_COUNT, offset=0):
        return query.limit(limit).offset(offset).get_sql()
