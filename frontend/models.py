from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.signals import request_finished

from core.models import Operation
from core.tasks import count_operation_rows as count


@receiver(post_save, sender=Operation, dispatch_uid="count_operation_rows")
def count_operation_rows(sender, instance=None, created=False, **kwargs):
    if instance and instance.count_rows:
        count.delay(instance)

request_finished.connect(count_operation_rows, dispatch_uid="count_operation_rows")
