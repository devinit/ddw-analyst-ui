from django.db import models
from django.contrib.auth.models import User

# Create your models here.

# TODO: Discuss with team if there is a better way to managing migration and inspectdb at the same time
from core.models_template import *


class BaseEntity(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True


class Sector(BaseEntity):
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)


class Theme(BaseEntity):
    sector = models.ForeignKey(Sector, models.PROTECT)
    name = models.CharField(max_length=50)


class Tag(BaseEntity):
    name = models.CharField(max_length=255)


class Operation(BaseEntity):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, models.PROTECT, blank=True, null=True)
    operation_query = models.TextField()
    theme = models.ForeignKey(Theme, models.PROTECT)
    sample_output_path = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag)
    is_draft = models.BooleanField(default=True)


class OperationSteps(BaseEntity):
    operation = models.ForeignKey(Operation, models.PROTECT)
    step_id = models.SmallIntegerField()
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    query = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = (('operation', 'step_id'),)


class Reviews(BaseEntity):
    operation = models.ForeignKey(Operation, models.DO_NOTHING, blank=True, null=True)
    reviewer = models.ForeignKey(User, models.PROTECT)
    rating = models.SmallIntegerField()
    comment = models.TextField(blank=True, null=True)


class Source(BaseEntity):
    indicator = models.TextField()
    indicator_acronym = models.CharField(max_length=10, blank=True, null=True)
    source = models.TextField()
    source_acronym = models.CharField(max_length=10, blank=True, null=True)
    source_url = models.TextField(blank=True, null=True)
    download_path = models.TextField(blank=True, null=True)
    last_updated_on = models.DateTimeField(auto_now=True)
    storage_type = models.TextField(blank=True, null=True)
    active_mirror_name = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)


class SourceColumnMap(BaseEntity):
    source = models.ForeignKey(Source, models.PROTECT, blank=True, null=True)
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    source_name = models.TextField()

    class Meta:
        unique_together = (('source', 'name'),)


class UpdateHistory(BaseEntity):
    source = models.ForeignKey(Source, models.PROTECT)
    history_table = models.TextField()
    is_major_release = models.BooleanField(default=False)
    released_on = models.DateTimeField()
    release_description = models.TextField(blank=True, null=True)
    invalidated_on = models.DateTimeField()
    invalidation_description = models.TextField(blank=True, null=True)
