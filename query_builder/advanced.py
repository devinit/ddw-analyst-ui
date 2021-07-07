
# from data.db_manager import run_query
import operator
from pypika.enums import JoinType
from pypika.queries import Query, Table
from pypika import Criterion
from pypika import functions as fn
from pypika import Order

from core.models import Source, SourceColumnMap
from core.const import DEFAULT_LIMIT_COUNT

FILTER_MAPPING = {
    '$lt': operator.lt,
    '$le': operator.le,
    '$eq': operator.eq,
    '$neq': operator.ne,
    '$gt': operator.gt,
    '$gte': operator.ge,
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
        table = self.get_source_table(config.get('source'))
        query = Query.from_(table)

        if 'join' in config:
            join_query = self.handle_join(table, query, config)
            print(join_query)

            return join_query

        if 'filter' in config:
            filter_query = self.handle_filter(table, query, config)
            print(filter_query)

            return filter_query

        if 'columns' in config or 'selectall' in config:
            select_query = self.get_select_query(table, query, config)
            print(select_query)

            return select_query

    def get_source_table(self, source_id, as_array=False):
        source = Source.objects.get(pk=source_id)

        table_name = source.active_mirror_name
        schema_name = source.schema

        if as_array:
            return [table_name, schema_name]

        return Table(table_name, schema=schema_name)

    def get_source_columns(self, source_id):
        source_columns = SourceColumnMap.objects.filter(source_id=source_id)
        columns = []
        for source_column in source_columns:
            columns.append({'id': source_column.id, 'name': source_column.name, 'alias':source_column.alias})
        return columns

    def handle_filter(self, table, query, config):
        filter_config = config.get('filter')
        if 'columns' in config and config.get('columns'):
            selectQuery = self.get_select_query(table, query, config)
            return self.get_filter_query(table, selectQuery, filter_config)

        return self.get_filter_query(table, query, filter_config)

    def handle_join(self, table, query, config):
        join_config = config.get('join')
        join_table = self.get_source_table(join_config.get('source'))

        join_mapping = join_config.get('mapping')
        if len(join_mapping) > 1:
            join_query = query.join(join_table, JOIN_MAPPING[join_config.get('type')]).on(operator.and_(*[
                operator.eq(table[mapping[0]], join_table[mapping[1]]) for mapping in join_mapping
            ]))
        else:
            join_query = query.join(join_table, JOIN_MAPPING[join_config.get('type')]).on(*[
                operator.eq(table[mapping[0]], join_table[mapping[1]]) for mapping in join_mapping
            ])
        if 'filter' in config:
            join_query = self.handle_filter(table, join_query, config)

            return join_query

        if 'columns' in config and config.get('columns'):
            join_query = self.get_select_query(table, join_query, config)

        return join_query

    def get_select_query(self, table, query, config):
        if 'groupby' in config:
            query = self.get_groupby_query(table, query, config.get('groupby'))
        if 'having' in config:
            query = self.get_having_query(table, query, config.get('having'))

        if 'selectall' in config and config.get('selectall'):
            all_columns = self.get_source_columns(config.get('source'))
            if 'columns' in config:
                # re-arrange columns starting by those in config first
                provided_cols = config.get('columns')
                for provided_col in provided_cols:
                    j = next((i for i, item in enumerate(all_columns) if item['name'] == provided_col['name']), False)
                    if j:
                        all_columns.pop(j)
                columns = provided_cols + all_columns
            else:
                columns = all_columns
        else:
            columns = config.get('columns')

        # Handle select for joins
        if 'join' in config:
            join_config = config.get('join')
            left_table = table
            right_table = self.get_source_table(join_config.get('source'))
            join_cols = join_config.get('columns')
            right_cols = [FUNCTION_MAPPING[join_col.get('aggregate')](right_table[join_col.get('name')]).as_(join_col.get(
                         'alias')) if 'aggregate' in join_col else right_table[join_col.get('name')].as_(join_col.get('alias')) for join_col in join_cols]
            left_cols = [FUNCTION_MAPPING[column.get('aggregate')](table[column.get('name')]).as_(column.get(
                        'alias')) if 'aggregate' in column else table[column.get('name')].as_(column.get('alias')) for column in columns]
            final_cols = left_cols + right_cols
        else:
            final_cols = [FUNCTION_MAPPING[column.get('aggregate')](table[column.get('name')]).as_(column.get(
            'alias')) if 'aggregate' in column else table[column.get('name')].as_(column.get('alias')) for column in columns]

        # also handles aggregations and aliases...
        query = query.select(*final_cols)

        if 'orderby' in config:
            orderby = config.get('orderby')
            return query.orderby(table[orderby[0]], order=ORDERBY_MAPPING[orderby[1]])

        return query

    def get_groupby_query(self, table, query, columns):
        # TODO: handle .having here as its usage is based on the groupby
        return query.groupby(*[table[column] for column in columns])

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
        elif self.orKey in config:
            rootConfig = config.get(self.orKey)

        # a way to handle complex having configs
        crit = Criterion.all([ self.get_having_criterion(table, config) for config in rootConfig ])

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

        value = config.get('value')
        if 'plain' in value:
            value = value.get('plain')
        else:
            value = FUNCTION_MAPPING[value.get('aggregate')](table[value.get('column')])
        if 'aggregate' in config:
            return FILTER_MAPPING[config.get('comp')](FUNCTION_MAPPING[config.get('aggregate')](table[config.get('column')]), value)
        return FILTER_MAPPING[config.get('comp')](table[config.get('column')], value)

    def get_count_sql(self, config, estimate=True):
        if estimate:
            stats_table = Table("pg_stat_user_tables")
            table_parts = self.get_source_table(config.get('source'), True)
            table_name = table_parts[0]
            schema_name = table_parts[1]
            return Query.from_(stats_table).select(stats_table.n_live_tup).where(stats_table.relname == table_name).where(stats_table.schemaname == schema_name).get_sql()
        query = self.process_config(config)
        return query.select(fn.Count('*')).get_sql()

    def get_sql_with_limit(self, query, limit=DEFAULT_LIMIT_COUNT, offset=0):
        return query.limit(limit).offset(offset).get_sql()


# TODO: test code - remove in production
def get_config():
    return {
        'source': 1,
        'selectall': True,
        'columns': [
            { 'id': 23, 'name': 'donor_name', 'alias': 'Donor Name' },
            { 'id': 20, 'name': 'agency_name', 'alias': 'Agency' }
        ],
        'groupby': ['donor_name', 'agency_name'],
        'having': {
            '$and': [
                { 'column': 'donor_name', 'aggregate': 'SUM', 'comp': '$eq', 'value': { 'plain': 'United States' } },
                { 'column': 'agency_name', 'comp': '$eq', 'value': { 'column': 'agency_name', 'aggregate': 'MIN' } },
                {
                    '$or': [
                        { 'column': 'agency_name', 'aggregate': 'MAX', 'comp': '$gte', 'value': { 'column': 'donor_name', 'aggregate': 'MIN' } },
                        { 'column': 'agency_name', 'comp': '$eq', 'value': { 'column': 'donor_name', 'aggregate': 'MIN' } },
                    ],
                },
            ],
        },
        'filter': {
            '$and': [
                { 'column': 'donor_name', 'comp': '$eq', 'value': 'United States' },
                { 'column': 'agency_name', 'comp': '$eq', 'value': 'Department of Agriculture' },
                {
                    '$or': [
                        { 'column': 'agency_name', 'comp': '$eq', 'value': 'Department of Agriculture' },
                        { 'column': 'agency_name', 'comp': '$eq', 'value': 'Miscellaneous' },
                    ],
                },
            ],
        },
        'join': {
            'source': 5,
            'type': 'inner',
            'mapping': [['donor_name', 'donor_name']],
            'columns': [
                { 'id': 23, 'name': 'donor_name', 'alias': 'Donor Name' },
                { 'id': 20, 'name': 'agency_name', 'alias': 'Agency' }
            ]
        },
        'orderby': ['donor_name', 'ASC' ]
    }

def build_query():
    # TODO: test code - remove in production
    config = get_config()

    builder = AdvancedQueryBuilder()
    query = builder.process_config(config)

    # data = run_query(query.get_sql(), fetch=True)
    # print(data)
