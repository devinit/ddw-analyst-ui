from django.contrib import admin
from core.models import Sector, Theme, Tag, Operation, OperationSteps, Reviews, Source, SourceColumnMap, UpdateHistory

# Register your models here.

admin.site.register(Sector)
admin.site.register(Theme)
admin.site.register(Tag)
admin.site.register(Operation)
admin.site.register(OperationSteps)
admin.site.register(Reviews)
admin.site.register(Source)
admin.site.register(SourceColumnMap)
admin.site.register(UpdateHistory)
