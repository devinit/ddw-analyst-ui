
import json

from ddw_analyst_ui.celery import app

from core.pypika_utils import QueryBuilder
from core.pypika_fts_utils import TableQueryBuilder
from core.query import get_advanced_config_count_query
from data.db_manager import count_rows, run_query
from core.models import FrozenData, Operation, SavedQueryData, Source

@app.task(bind=False)
def count_operation_rows(id):
    operation = Operation.objects.get(id=id)
    if operation:
        if operation.advanced_config and len(operation.advanced_config) > 0:
            count_query = get_advanced_config_count_query(operation.advanced_config, False)
        else:
            count_query = QueryBuilder(operation=operation, operation_steps=None).count_sql(False)
        count = count_rows(count_query)
        operation.row_count = count
        operation.count_rows = False
        operation.save()
        return { "status": "success" }
    else:
        return { "status": "failed" }


@app.task(bind=False)
def create_table_archive(id):
    try:
        frozen_data = FrozenData.objects.get(id=id)
        source = Source.objects.get(active_mirror_name=frozen_data.parent_db_table)
        schema = source.schema
        query_builder = TableQueryBuilder(frozen_data.parent_db_table, schema)
        create_query = query_builder.select().create_table_from_query(frozen_data.frozen_db_table, "archives")
        create_result = run_query(create_query)
        if create_result[0]['result'] == 'success':
            frozen_data.status = 'c'
            frozen_data.save()
            return { "status": "success" }
        elif create_result[0]['result'] == 'error':
            frozen_data.status = 'e'
            frozen_data.logs = 'Failed to create table archive: ' + create_result[0]['message']
            frozen_data.save()
            return { "status": "failed", "result": create_result[0]['message'] }
        else:
            frozen_data.status = 'e'
            frozen_data.logs = 'Failed to create table archive: ' + json.dumps(create_result)
            frozen_data.save()
            return { "status": "failed", "result": json.dumps(create_result) }
    except FrozenData.DoesNotExist:
        return { "status": "errored", "result": id }


@app.task(bind=False)
def create_dataset_archive(id):
    try:
        query_data = SavedQueryData.objects.get(id=id)
        query_builder = TableQueryBuilder(query_data.saved_query_db_table, operation=query_data.operation)
        create_query = query_builder.create_table_from_query(query_data.saved_query_db_table, "dataset")
        create_result = run_query(create_query)
        if create_result[0]['result'] == 'success':
            query_data.status = 'c'
            query_data.save()
            return { "status": "success" }
        elif create_result[0]['result'] == 'error':
            query_data.status = 'e'
            query_data.logs = 'Failed to create dataset archive: ' + create_result[0]['message']
            query_data.save()
            return { "status": "failed", "result": create_result[0]['message'] }
        else:
            query_data.status = 'e'
            query_data.logs = 'Failed to create dataset archive: ' + json.dumps(create_result)
            query_data.save()
            return { "status": "failed", "result": json.dumps(create_result) }
    except SavedQueryData.DoesNotExist:
        return { "status": "errored", "result": id }
