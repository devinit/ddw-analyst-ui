
# from data.db_manager import fetch_data_only
import operator
from pypika.queries import Query, Table
from pypika import Criterion

from core.models import Source

FILTER_MAPPING = {
    "$lt": operator.lt,
    "$le": operator.le,
    "$eq": operator.eq,
    "$neq": operator.ne,
    "$gt": operator.gt,
    "$gte": operator.ge,
}

class AdvancedQueryBuilder:
    def __init__(self, operation=None):
        self.andKey = '$and'
        self.orKey = '$or'

    def process_config(self, config):
        source = Source.objects.get(pk=config.get('source'));

        table_name = source.active_mirror_name
        schema_name = source.schema

        table = Table(table_name, schema=schema_name)
        query = Query.from_(table)

        if 'filter' in config:
            filterQuery = self.handle_filter(table, query, config)
            print(filterQuery)

            # data = fetch_data_only(filterQuery.get_sql())
            # print(data)
            return

    def handle_filter(self, table, query, config):
        filterConfig = config.get('filter')
        if 'columns' in config and config.get('columns'):
            selectQuery = self.get_select_query(table, query, config.get('columns'))
            return self.get_filter_query(table, selectQuery, filterConfig)

        return self.get_filter_query(table, query, filterConfig)

    def get_select_query(self, table, query, columns):
        return query.select(*[table[column] for column in columns])

    def get_filter_query(self, table, query, config):
        if self.andKey in config:
            andConfig = config.get(self.andKey)

            # a way to handle complex filter configs
            crit = Criterion.all([ self.get_filter_criterion(table, config) for config in andConfig ])

            # sample query
            return query.where(crit)

    def get_filter_criterion(self, table, filter):
        if self.andKey in filter:
            andConfig = filter.get(self.andKey)
            return Criterion.all([ self.get_filter_criterion(table, config) for config in andConfig ])

        if self.orKey in filter:
            orConfig = filter.get(self.orKey)
            return Criterion.any([ self.get_filter_criterion(table, config) for config in orConfig ])

        return FILTER_MAPPING[filter.get('comp')](table[filter.get('column')], filter.get('value'))



# TODO: test code - remove in production
def get_config():
    return {
        'source': 1,
        'columns': ['donor_name', 'agency_name'],
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
            'mapping': [['donor_name', 'donor_name']]
        }
    }

def build_query():
    # TODO: test code - remove in production
    config = get_config()

    builder = AdvancedQueryBuilder()
    builder.process_config(config)
