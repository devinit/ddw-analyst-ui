from ddw_analyst_ui.celery import app

from core.pypika_utils import QueryBuilder
from data.db_manager import count_rows
from core.models import Operation

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
