from ddw_analyst_ui.celery import app

from core.pypika_utils import QueryBuilder
from data.db_manager import count_rows

@app.task(bind=False)
def count_operation_rows(operation):
    count_query = QueryBuilder(operation=operation, operation_steps=None).count_sql(False)
    count = count_rows(count_query)
    operation.row_count = count
    operation.count_rows = False
    operation.save()
