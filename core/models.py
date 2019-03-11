from django.db import models
from django.contrib.auth.models import User
from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data

# Create your models here.

# TODO: Discuss with team if there is a better way to managing migration and inspectdb at the same time
# from core.models_template import *


class BaseEntity(models.Model):
    """An abstract model which allows all other models to inherit its characteristics.
    Gives every other model a field for the date it was created and the date it was updated."""
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class Sector(BaseEntity):
    """Metadata sector model."""
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Theme(BaseEntity):
    """Metadata theme model. Belongs to sectors."""
    sector = models.ForeignKey(Sector, models.PROTECT)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Tag(BaseEntity):
    """A tag model for queries."""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Operation(BaseEntity):
    """This is the base model on which a query is built. It stores all of the meta-data for a query."""
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    operation_query = models.TextField()
    theme = models.ForeignKey(Theme, models.PROTECT)
    sample_output_path = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag)
    is_draft = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def build_query(self):
        return QueryBuilder(self).get_sql()

    def query_table(self):
        return fetch_data(self.build_query())


class Source(BaseEntity):
    """Metadata data source."""
    indicator = models.TextField()
    indicator_acronym = models.CharField(max_length=10, blank=True, null=True)
    source = models.TextField()
    source_acronym = models.CharField(max_length=10, blank=True, null=True)
    source_url = models.TextField(blank=True, null=True)
    download_path = models.TextField(blank=True, null=True)
    last_updated_on = models.DateTimeField(auto_now=True)
    schema = models.TextField(blank=True, null=True)
    storage_type = models.TextField(blank=True, null=True)
    active_mirror_name = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return "{} from {}".format(self.indicator_acronym, self.source_acronym)

    def sql_table(self):
        return "{}.{}".format(self.schema, self.active_mirror_name)


class OperationStep(BaseEntity):
    """These are the individual steps in a query."""
    operation = models.ForeignKey(Operation, models.PROTECT)
    step_id = models.SmallIntegerField()
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    query_func = models.TextField(blank=True, null=True)
    query_kwargs = models.TextField(blank=True, null=True)
    source = models.ForeignKey(Source, models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (('operation', 'step_id'),)


class Review(BaseEntity):
    """A model to allow users to review other queries?"""
    operation = models.ForeignKey(Operation, models.DO_NOTHING, blank=True, null=True)
    rating = models.SmallIntegerField()
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return "Review of {} by {}".format(self.operation, self.user)


class SourceColumnMap(BaseEntity):
    """Column mapping for datasets."""
    source = models.ForeignKey(Source, models.PROTECT, blank=True, null=True)
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    source_name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (('source', 'name'),)


class UpdateHistory(BaseEntity):
    """Update history model for datasets."""
    source = models.ForeignKey(Source, models.PROTECT)
    history_table = models.TextField()
    is_major_release = models.BooleanField(default=False)
    released_on = models.DateTimeField()
    release_description = models.TextField(blank=True, null=True)
    invalidated_on = models.DateTimeField()
    invalidation_description = models.TextField(blank=True, null=True)

    def __str__(self):
        return "Update of {} on {}".format(self.source, self.released_on)

    class Meta:
        verbose_name_plural = "Update histories"


class AuditLogEntry(models.Model):
    """Consolidated audit log model. Should keep track of every change on every internal model."""
    CREATE = 0
    UPDATE = 1
    DELETE = 2

    action_choices = (
        (CREATE, "create"),
        (UPDATE, "update"),
        (DELETE, "delete"),
    )

    timestamp = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)
    action = models.PositiveSmallIntegerField(choices=action_choices, blank=True, null=True)
    object_id = models.BigIntegerField(blank=True, null=True)
    object_str = models.CharField(max_length=255)
    object_ctype = models.CharField(max_length=255)

    def __str__(self):
        if self.action == AuditLogEntry.CREATE:
            fstring = "Created {}: {}"
        elif self.action == AuditLogEntry.UPDATE:
            fstring = "Updated {}: {}"
        elif self.action == AuditLogEntry.DELETE:
            fstring = "Deleted {}: {}"
        else:
            fstring = "Logged {}: {}"

        return fstring.format(self.object_ctype, self.object_str)

    class Meta:
        verbose_name_plural = "Audit log entries"
