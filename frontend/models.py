from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.signals import request_finished

from core.models import Operation
from core.tasks import count_operation_rows as count, create_operation_data_aliases as aliases


@receiver(post_save, sender=Operation, dispatch_uid="operation__post_save")
def operation_post_save(sender, instance=None, created=False, **kwargs):
    if instance:
        if instance.count_rows:
            count.delay(instance.id)
        aliases.delay(instance.id)

request_finished.connect(operation_post_save, dispatch_uid="operation__post_save")
