
# from data.db_manager import fetch_data_only
import operator
from pypika.enums import JoinType
from pypika.queries import Query, Table
from pypika import Criterion
from pypika import functions as fn
from pypika import Order

from core.models import Source

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

        if 'columns' in config:
            select_query = self.get_select_query(table, query, config)
            print(select_query)

            return select_query

        # data = fetch_data_only(joinQuery.get_sql())
        # print(data)

    def get_source_table(self, source_id):
        source = Source.objects.get(pk=source_id);

        table_name = source.active_mirror_name
        schema_name = source.schema

        return Table(table_name, schema=schema_name)

    def handle_filter(self, table, query, config):
        filter_config = config.get('filter')
        if 'columns' in config and config.get('columns'):
            selectQuery = self.get_select_query(table, query, config)
            return self.get_filter_query(table, selectQuery, filter_config)

        return self.get_filter_query(table, query, filter_config)

    def handle_join(self, table, query, config):
        join_config = config.get('join')
        join_table = self.get_source_table(join_config.get('source'))

        join_query = query.join(join_table, JOIN_MAPPING[join_config.get('type')]).on(operator.and_(*[
            operator.eq(table[mapping[0]], join_table[mapping[1]]) for mapping in join_config.get('mapping')
        ]))
        if 'filter' in config:
            join_query = self.handle_filter(table, join_query, config)

            return join_query

        if 'columns' in config and config.get('columns'):
            join_query = self.get_select_query(table, join_query, config.get('columns'))

        return join_query

    def get_select_query(self, table, query, config):
        columns = config.get('columns')
        if 'groupby' in config:
            query = self.get_groupby_query(table, query, config.get('groupby'))
        if 'having' in config:
            query = self.get_having_query(table, query, config.get('having'))

        # also handles aggregations and aliases...
        query = query.select(*[FUNCTION_MAPPING[column.get('aggregate')](table[column.get('name')]).as_(column.get(
            'alias')) if 'aggregate' in column else table[column.get('name')].as_(column.get('alias')) for column in columns])

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
        elif self.orKey in config:
            rootConfig = config.get(self.orKey)

        # a way to handle complex filter configs
        crit = Criterion.all([ self.get_filter_criterion(table, config) for config in rootConfig ])

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



# TODO: test code - remove in production
def get_config():
    return {
        'source': 1,
        'selectall': True,
        'columns': [
            { 'id': 23, 'name': 'donor_name', 'alias': 'Donor Name', 'aggregate': 'SUM' },
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
            'mapping': [['donor_name', 'donor_name'], ['year', 'year']]
        },
        'orderby': ['donor_name', 'ASC' ]
    }

def build_query():
    # TODO: test code - remove in production
    config = get_config()

    builder = AdvancedQueryBuilder()
    builder.process_config(config)
