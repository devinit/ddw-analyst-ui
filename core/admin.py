from django.contrib import admin
from core.models import Sector, Theme, Tag, Operation, OperationStep, Review, Source, SourceColumnMap, UpdateHistory

# Register your models here.

admin.site.register(Sector)
admin.site.register(Theme)
admin.site.register(Tag)
admin.site.register(Operation)
admin.site.register(OperationStep)
admin.site.register(Review)
admin.site.register(Source)
admin.site.register(SourceColumnMap)
admin.site.register(UpdateHistory)
