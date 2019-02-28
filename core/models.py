from django.db import models
from django.contrib.auth.models import User

# Create your models here.

# TODO: Discuss with team if there is a better way to managing migration and inspectdb at the same time
from core.models_template import *


class Sector(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)


class Theme(models.Model):
    sector = models.ForeignKey(Sector, models.SET_NULL)
    name = models.CharField(max_length=50)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)


class Operation(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, models.SET_NULL)
    operation_query = models.TextField()
    theme = models.ForeignKey(Theme, models.SET_NULL)
    sample_output_path = models.TextField(blank=True, null=True)
    is_draft = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)


class OperationSteps(models.Model):
    operation = models.ForeignKey(Operation, models.DO_NOTHING)
    step_id = models.SmallIntegerField()
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    query = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        unique_together = (('operation', 'step_id'),)


class Tag(models.Model):
    name = models.CharField(max_length=255)


class OperationTags(models.Model):
    operation = models.ForeignKey(Theme, models.SET_NULL)
    tags = models.ManyToManyField(Tag, blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now_add=True, blank=True, null=True)


class Reviews(models.Model):
    operation = models.ForeignKey(Operation, models.SET_NULL, blank=True, null=True)
    reviewer = models.ForeignKey(User, models.SET_NULL)
    rating = models.SmallIntegerField()
    comment = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)


class Source(models.Model):
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
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)


class SourceColumnMap(models.Model):
    source = models.ForeignKey(Source, models.SET_NULL, blank=True, null=True)
    name = models.TextField()
    source_name = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        unique_together = (('source', 'name'),)


class UpdateHistory(models.Model):
    source = models.ForeignKey(Source, models.SET_NULL)
    history_table = models.TextField()
    is_major_release = models.BooleanField(default=False)
    released_on = models.DateTimeField()
    release_description = models.TextField(blank=True, null=True)
    invalidated_on = models.DateTimeField()
    invalidation_description = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)
