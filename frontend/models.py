from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.signals import request_finished

from core.pypika_utils import QueryBuilder
from core.models import Operation

from data.db_manager import count_rows


@receiver(post_save, sender=Operation)
def count_operation_rows(sender, instance=None, created=False, **kwargs):
    if instance and instance.count_rows:
        count_query = QueryBuilder(operation=instance, operation_steps=None).count_sql(False)
        count = count_rows(count_query)
        instance.row_count = count
        instance.count_rows = False
        instance.save()

request_finished.connect(count_operation_rows, dispatch_uid="count_operation_rows")
