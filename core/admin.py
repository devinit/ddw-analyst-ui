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


_ModelT = TypeVar('_ModelT', bound=ETLQuery)


class AuditLogEntryAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp', )


class ETLQueryAdmin(admin.ModelAdmin):

    readonly_fields = ('saved_dataset', 'user', )

    def save_model(self, request: Any, obj: _ModelT, form: Any, change: Any) -> None:
        obj.user = request.user
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
