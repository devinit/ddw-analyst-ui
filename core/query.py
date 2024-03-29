import re

from django.db import transaction
from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data, analyse_query, run_query
from core.models import FrozenData, OperationStep, Source, Operation, FrozenData, SourceColumnMap
from pypika import Table, Query
from pypika import functions as pypika_fn
from core.pypika_fts_utils import TableQueryBuilder
from query_builder.advanced import AdvancedQueryBuilder

def build_query(operation=None, steps=None, limit=None, offset=None, estimate_count=None, frozen_table_id=None):
    """Build an SQL query"""
    count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(estimate_count)
    if not count_query and estimate_count: # if count returns 0, remove estimate TODO: figure out why count would contradict actual results
        count_query = QueryBuilder(operation=operation, operation_steps=steps).count_sql(False)
    if limit is None:
        data_query = QueryBuilder(operation=operation, operation_steps=steps).get_sql_without_limit()
    else:
        data_query = QueryBuilder(operation=operation, operation_steps=steps).get_sql(limit, offset)
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
    queries = build_query(operation, steps=operation_steps, limit=limit, offset=offset, estimate_count=estimate_count, frozen_table_id=frozen_table_id)
    return fetch_data(queries)

def querytime_estimate(operation=None, operation_steps=None):
    query = QueryBuilder(operation=operation, operation_steps=operation_steps).get_sql_without_limit()
    return analyse_query(query)

@transaction.atomic
def delete_archive(id):
    try:
        frozen_data = FrozenData.objects.get(pk=id)
        table_name = frozen_data.frozen_db_table
        # Delete from sources table and operation steps
        frozen_source = Source.objects.filter(schema='archives', active_mirror_name=table_name)
        operation_step_qs = OperationStep.objects.filter(source_id__in=frozen_source)
        frozen_column_maps = SourceColumnMap.objects.filter(source_id__in=frozen_source)
        operation = Operation.objects.filter(pk__in=operation_step_qs.values_list('operation_id', flat=True))
        operation.delete()
        operation_step_qs.delete()
        #Delete frozen column maps before deleting frozen source
        for column_map in frozen_column_maps:
            column_map.delete()
        frozen_source.delete()
        frozen_data.delete()
        query_builder = TableQueryBuilder(table_name, "archives")
        delete_sql = query_builder.delete_table(table_name, "archives")
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
        for operation in operations:
            operation.operationstep_set.all().delete()
            operation.operationdatacolumnalias_set.all().delete()
        operations.delete()
        return True
    except Operation.DoesNotExist:
        return False

def get_advanced_config_query(advanced_config, limit=None, offset=None):
    builder = AdvancedQueryBuilder()
    query = builder.process_config(advanced_config)
    if limit is None:
        return query.get_sql()
    else:
        return query.limit(limit).offset(offset).get_sql()

def get_advanced_config_count_query(advanced_config, estimate_count):
    builder = AdvancedQueryBuilder()
    return builder.get_count_sql(advanced_config, estimate_count)

def build_advanced_queries(advanced_config, limit=None, offset=None, estimate_count=False):
    count_sql = get_advanced_config_count_query(advanced_config, estimate_count)
    if not count_sql and estimate_count: # if count returns 0, remove estimate TODO: figure out why count would contradict actual results
        count_sql = get_advanced_config_count_query(advanced_config, False)
    data_sql = get_advanced_config_query(advanced_config, limit, offset)
    return (count_sql, data_sql)

def advanced_query_table(config, limit=None, offset=None, estimate_count=False):
    limit = 10000 if limit is None or int(limit) > 10000 else limit
    offset = offset or 0
    queries = build_advanced_queries(config, limit, offset, estimate_count)
    return fetch_data(queries)

def get_all_frozen_dataset(table, schema='dataset'):
    table_name = Table(table, schema=schema)
    data_query = Query.from_(table_name).select(table_name.star).get_sql()
    count_query = Query.from_(table_name).select(pypika_fn.Count(table_name.star)).get_sql()
    return fetch_data((count_query, data_query))

# for raw sql queries
def format_query_for_preview(query, limit=10, offset=0):
    final_query = query
    if not find_whole_word('limit')(query) or not find_whole_word('offset')(query):
        final_query = '%s LIMIT %s OFFSET %s;' % (query.split(';')[0], limit, offset)

    return final_query

def find_whole_word(word):
    return re.compile(r'\b({0})\b'.format(word), flags=re.IGNORECASE).search
