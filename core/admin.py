import datetime
from django.contrib import admin
from typing import Any, TypeVar

from core.models import (
    AuditLogEntry,
    Operation,
    OperationStep,
    OperationDataColumnAlias,
    Review,
    ScheduledEvent,
    ScheduledEventRunInstance,
    Sector,
    Source,
    SourceColumnMap,
    Tag,
    Theme,
    UpdateHistory,
    FrozenData,
    SavedQueryData,
    ETLQuery,
)
from core.pypika_fts_utils import TableQueryBuilder
from core.tasks import create_dataset_archive
from .forms import ETLQueryForm


_ModelT = TypeVar('_ModelT', bound=ETLQuery) # To be used for type-checking


class AuditLogEntryAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp', )


class ETLQueryAdmin(admin.ModelAdmin):

    readonly_fields = ('saved_dataset', 'user', )
    list_display = ('id', 'query', 'etl_process', 'saved_dataset', 'active')
    form = ETLQueryForm

    def save_model(self, request: Any, obj: _ModelT, form: Any, change: Any) -> None:
        obj.user = request.user
        saved_query_set = SavedQueryData.objects.filter(operation=obj.query).order_by('-id').first()
        if saved_query_set:
            obj.saved_dataset = saved_query_set
        else:
            saved_query_db_table = "query_data_" + \
                datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            query_builder = TableQueryBuilder(
                saved_query_db_table, operation=obj.query)
            sql = query_builder.get_sql_without_limit()
            description = 'Automatically created while creating related ETL Query'
            saved_query_set = SavedQueryData(user=obj.user, full_query=sql, created_on=datetime.datetime.now(),
                            saved_query_db_table=saved_query_db_table, description=description, operation=obj.query)
            saved_query_set.save()
            obj.saved_dataset = saved_query_set
            create_dataset_archive.delay(saved_query_set.id)
        super().save_model(request, obj, form, change)


admin.site.register(Sector)
admin.site.register(Theme)
admin.site.register(Tag)
admin.site.register(Operation)
admin.site.register(OperationStep)
admin.site.register(OperationDataColumnAlias)
admin.site.register(Review)
admin.site.register(Source)
admin.site.register(SourceColumnMap)
admin.site.register(UpdateHistory)
admin.site.register(AuditLogEntry, AuditLogEntryAdmin)
admin.site.register(ScheduledEvent)
admin.site.register(ScheduledEventRunInstance)
admin.site.register(FrozenData)
admin.site.register(SavedQueryData)
admin.site.register(ETLQuery, ETLQueryAdmin)
