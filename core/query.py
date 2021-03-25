from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data, analyse_query, run_query
from core.models import FrozenData, Source, SourceColumnMap, Operation, FrozenData
from pypika import Table
from core.pypika_fts_utils import TableQueryBuilder

def build_query(operation=None, steps=None, limit=None, offset=None, estimate_count=None, frozen_table_id=None):
    """Build an SQL query"""
    count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(estimate_count)
    if not count_query and estimate_count: # if count returns 0, remove estimate TODO: figure out why count would contradict actual results
        count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(False)
    if limit is None:
        data_query = QueryBuilder(operation=operation, operation_steps=steps).get_sql_without_limit()
    else:
        data_query = QueryBuilder(operation=operation, operation_steps=steps).get_sql(limit, offset))
    if frozen_table_id:
        # We replace the old schema and table names with the ones of the frozen one
        try:
            frozen_data = FrozenData.objects.get(id=frozen_table_id)
            frozen_data_table = str(Table(frozen_data.frozen_db_table, schema="archives"))
            source = Source.objects.get(active_mirror_name=frozen_data.parent_db_table)
            full_table_name = str(Table(source.active_mirror_name, schema=source.schema))
            table_name = source.active_mirror_name
            count_query = count_query.replace(full_table_name, frozen_data_table)
            data_query = data_query.replace(table_name, frozen_data.frozen_db_table)
        except FrozenData.DoesNotExist:
            # We just ignore and use the parent table
            pass
    return (count_query, data_query)

def query_table(operation=None, limit=None, offset=None, estimate_count=None, operation_steps=None, frozen_table_id=None):
    """Build a query then execute it to return the matching data"""
    limit = 10000 if limit is None or int(limit) > 10000 else limit
    offset = offset or 0
    queries = build_query(operation, steps=operation_steps, limit=limit, offset=offset, estimate_count=estimate_count, frozen_table_id)
    return fetch_data(queries)

def querytime_estimate(operation=None, operation_steps=None):
    query = QueryBuilder(operation=operation, operation_steps=operation_steps).get_sql_without_limit()
    return analyse_query(query)

def delete_archive(id):
    try:
        frozen_data = FrozenData.objects.get(pk=id)
        frozen_data.delete()
        query_builder = TableQueryBuilder(table_name, "archive")
        delete_sql = query_builder.delete_table(table_name, "archive")
        delete_result = run_query(delete_sql)
        if delete_result[0]['result'] == 'success':
            delete_source(table_name)
        return delete_result
    except FrozenData.DoesNotExist:
        return False

def delete_source(table_name):
    try:
        delete_operations(table_name)
        source = Source.objects.get(active_mirror_name=table_name)
        column_maps = source.sourcecolumnmap_set.all().delete()
        source.delete()
        return True
    except Source.DoesNotExist:
        return False

def delete_operations(table_name):
    # Only use this for frozen tables. Otherwise we need to modify to handle active tables
    # to avoid errors like deleting a query for fts_codenames when fts table is deleted
    try:
        operations = Operation.objects.filter(operation_query__contains=table_name)
        operations.delete()
    except Operation.DoesNotExist:
        return False
