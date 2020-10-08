from ddw_analyst_ui.celery import app

from core import query
from core.pypika_utils import QueryBuilder
from data.db_manager import count_rows
from core.models import Operation, OperationDataColumnAlias, SourceColumnMap

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


def create_operation_alias(self, operation, column_name, column_alias):
    return OperationDataColumnAlias.objects.create(
        operation=operation, column_name=column_name, column_alias=column_alias)


@app.task(bind=False)
def create_operation_data_aliases(id):
    operation = Operation.objects.get(id=id)
    if not operation:
        return { "status": "failed" }

    count, data = query.query_table(operation, 1, 0, estimate_count=True)
    try:
        data_column_keys = data[0].keys()
        first_step = operation.get_operation_steps()[0]
        columns = SourceColumnMap.objects.filter(source=first_step.source, name__in=data_column_keys)
        # delete obsolete aliases
        OperationDataColumnAlias.objects.filter(operation=operation).exclude(column_name__in=data_column_keys).delete()
        for column in data_column_keys:
            existing_alias = OperationDataColumnAlias.objects.filter(operation=operation, column_name=column).first()
            if not existing_alias:
                matching = columns.filter(name=column).first()
                alias = create_operation_alias(operation, column, matching.alias if matching else column)
                alias.save()

        return { "status": "success" }
    except: # FIXME: handle specific errors
        return { "status": "failed" }
