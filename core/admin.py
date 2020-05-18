from django.contrib import admin

from core.models import (
    AuditLogEntry,
    Operation,
    OperationStep,
    Review,
    ScheduledEvent,
    ScheduledEventRunInstance,
    Sector,
    Source,
    SourceColumnMap,
    Tag,
    Theme,
    UpdateHistory
)


class AuditLogEntryAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp', )


admin.site.register(Sector)
admin.site.register(Theme)
admin.site.register(Tag)
admin.site.register(Operation)
admin.site.register(OperationStep)
admin.site.register(Review)
admin.site.register(Source)
admin.site.register(SourceColumnMap)
admin.site.register(UpdateHistory)
admin.site.register(AuditLogEntry, AuditLogEntryAdmin)
admin.site.register(ScheduledEvent)
admin.site.register(ScheduledEventRunInstance)
