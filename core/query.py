from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data

def build_query(operation=None, steps=None, limit=None, offset=None, estimate_count=None):
    """Build an SQL query"""
    count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(estimate_count)
    if not count_query: # if count returns 0, remove estimate TODO: figure out why count would contradict actual results
        count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(False)
    if limit is None:
        return (count_query, QueryBuilder(operation=operation, operation_steps=steps).get_sql_without_limit())
    return (count_query, QueryBuilder(operation=operation, operation_steps=steps).get_sql(limit, offset))

def query_table(operation=None, limit=None, offset=None, estimate_count=None, operation_steps=None):
    """Build a query then execute it to return the matching data"""
    limit = 10000 if limit is None or int(limit) > 10000 else limit
    offset = offset or 0
    queries = build_query(operation, steps=operation_steps, limit=limit, offset=offset, estimate_count=estimate_count)
    return fetch_data(queries)
