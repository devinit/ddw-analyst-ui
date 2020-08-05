from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data

def build_query(operation=None, steps=None, limit=None, offset=None, estimate_count=None):
        """Build an SQL query"""
        count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(estimate_count)
        if limit is None:
            return (count_query, QueryBuilder(operation=operation, operation_steps=steps).get_sql_without_limit())
        return (count_query, QueryBuilder(operation=operation, operation_steps=steps).get_sql(limit, offset))

def query_table(limit=10, offset=0, estimate_count=None, op_steps=None, operation=None):
    """Build a query then execute it to return the matching data"""
    if limit is None or int(limit) > 10000:
        limit = 10000
    queries = build_query(limit=limit, offset=offset, estimate_count=estimate_count, steps=op_steps, operation=operation)
    return fetch_data(queries)
