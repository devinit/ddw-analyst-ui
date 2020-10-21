
import json

from ddw_analyst_ui.celery import app

from core.pypika_utils import QueryBuilder
from core.pypika_fts_utils import TableQueryBuilder
from data.db_manager import count_rows, run_query
from core.models import FrozenData, Operation

@app.task(bind=False)
def count_operation_rows(id):
    operation = Operation.objects.get(id=id)
    if operation:
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
        query_builder = TableQueryBuilder(frozen_data.parent_db_table, "repo")
        create_query = query_builder.select().create_table_from_query(frozen_data.frozen_db_table, "archives")
        create_result = run_query(create_query)
        if create_result[0]['result'] == 'success':
            frozen_data.status = 'c'
            frozen_data.save()
            return { "status": "success" }
        else:
            frozen_data.status = 'e'
            frozen_data.logs = 'Failed to create table archive: ' + json.dumps(create_result)
            return { "status": "failed", "result": json.dumps(create_result) }
    except FrozenData.DoesNotExist:
        return { "status": "errored", "result": id }
