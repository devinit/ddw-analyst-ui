"""
    Database Models
"""
from django.contrib.auth.models import User
from django.db import models

from core.pypika_utils import QueryBuilder
from data.db_manager import fetch_data
from django.urls import reverse

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


class SourceColumnMap(BaseEntity):
    """Column mapping for datasets."""
    DATA_TYPE_CHOICES = (
        ("C", "Character"),
        ("N", "Numeric")
    )
    data_type = models.CharField(max_length=1, choices=DATA_TYPE_CHOICES, blank=True, null=True)
    source = models.ForeignKey(Source, models.PROTECT, blank=True, null=True)
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    source_name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (('source', 'name'),)


class Operation(BaseEntity):
    """
        This is the base model on which a query is built. It stores all of the meta-data for a query
    """
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    operation_query = models.TextField(blank=True, null=True)
    theme = models.ForeignKey(Theme, models.SET_NULL, blank=True, null=True)
    sample_output_path = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag)
    is_draft = models.BooleanField(default=True)
    # TODO: add direction relationship to source

    def __str__(self):
        return self.name

    def build_query(self, limit=None, offset=None, estimate_count=None):
        """Build an SQL query"""
        count_query = QueryBuilder(self).count_sql(estimate_count)
        if limit is None:
            return (count_query, QueryBuilder(self).get_sql_without_limit())
        return (count_query, QueryBuilder(self).get_sql(limit, offset))

    def query_table(self, limit, offset, estimate_count):
        """Build a query then execute it to return the matching data"""
        if limit is None or int(limit) > 10000:
            limit = 10000
        queries = self.build_query(limit, offset, estimate_count)
        return fetch_data(queries)

    def export_data(self):
        return reverse('export_stream', args=[self.pk])


class OperationStep(BaseEntity):
    """These are the individual steps in a query."""
    operation = models.ForeignKey(Operation, models.CASCADE)
    step_id = models.SmallIntegerField()
    name = models.CharField(max_length=200)
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


class UpdateHistory(BaseEntity):
    """Update history model for datasets."""
    source = models.ForeignKey(Source, models.PROTECT)
    history_table = models.TextField(blank=True, null=True)
    released_on = models.DateTimeField(auto_now_add=True)
    release_description = models.TextField(blank=True, null=True)

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


class ScheduledEvent(BaseEntity):
    """Scheduled Event Class."""
    interval_type_choices = (
        ('min', 'Minutes'),
        ('sec', 'Seconds'),
        ('hrs', 'Hours'),
        ('dys', 'Days'),
        ('wks', 'Weeks'),
        ('mnt', 'Months'),
        ('yrs', 'Years'),
    )
    name = models.TextField(null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    script_name = models.TextField(null=False, blank=False)
    enabled = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=False, blank=False)
    repeat = models.BooleanField(default=False)
    interval = models.BigIntegerField(blank=True, null=True)
    interval_type = models.CharField(max_length=3, choices=interval_type_choices, null=True, blank=True)

    def __str__(self):
        return self.name


class ScheduledEventRunInstance(BaseEntity):
    """Scheduled Event Run Instances."""
    status_choices = (
        ('p', 'Pending'),
        ('r', 'Running'),
        ('c', 'Completed'),
        ('e', 'Erroed'),
    )
    scheduled_event = models.ForeignKey(ScheduledEvent, on_delete=models.CASCADE)
    start_at = models.DateTimeField(null=False, blank=False)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=1, choices=status_choices, default='p')
