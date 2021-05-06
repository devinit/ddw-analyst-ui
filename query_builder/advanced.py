
# from data.db_manager import fetch_data_only
import operator
from pypika.enums import JoinType
from pypika.queries import Query, Table
from pypika import Criterion

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

            return

        if 'filter' in config:
            filter_query = self.handle_filter(table, query, config)
            print(filter_query)

            return

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
            selectQuery = self.get_select_query(table, query, config.get('columns'))
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
            'mapping': [['donor_name', 'donor_name'], ['year', 'year']]
        }
    }

def build_query():
    # TODO: test code - remove in production
    config = get_config()

    builder = AdvancedQueryBuilder()
    builder.process_config(config)
