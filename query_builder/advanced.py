
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
        pass

    def get_filter_criterion(self, table, filter):
        andKey = '$and'
        orKey = '$or'
        if andKey in filter:
            andConfig = filter.get(andKey)
            return Criterion.all([ self.get_filter_criterion(table, config) for config in andConfig ])

        if orKey in filter:
            orConfig = filter.get(orKey)
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
        }
    }

def build_query():
    # TODO: test code - remove in production
    config = get_config()

    source = Source.objects.get(pk=config.get('source'));

    table_name = source.active_mirror_name
    schema_name = source.schema

    table = Table(table_name, schema=schema_name)
    query = Query.from_(table)
    builder = AdvancedQueryBuilder()

    if 'filter' in config:
        filterConfig = config.get('filter')
        andKey = '$and'
        if andKey in filterConfig:
            andConfig = filterConfig.get(andKey)

            # a way to handle complex filter configs
            crit = Criterion.all([ builder.get_filter_criterion(table, config) for config in andConfig ])

            # sample query
            q = query.select(table.donor_name, table.agency_name).where(crit)
            print(q)
