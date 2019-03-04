from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from core.models import AuditLogEntry


@receiver(pre_delete)
def create_delete_record(sender, instance, **kwargs):
    """Create a new deleted log entry in the audit log on a pre-delete."""
    if sender._meta.app_label == 'core' and sender.__name__ != 'AuditLogEntry':
        new_log_entry = AuditLogEntry(
            action=AuditLogEntry.DELETE,
            object_id=instance.pk,
            object_str=instance.__str__(),
            object_ctype=sender.__name__
        )
        if hasattr(instance, "user"):
            new_log_entry.user = instance.user
        new_log_entry.save()


@receiver(post_save)
def create_save_record(sender, instance, created, **kwargs):
    """Create a new created or updated log entry in the audit log on a post-save."""
    if sender._meta.app_label == 'core' and sender.__name__ != 'AuditLogEntry':
        if created:
            query_action = AuditLogEntry.CREATE
        else:
            query_action = AuditLogEntry.UPDATE
        new_log_entry = AuditLogEntry(
            action=query_action,
            object_id=instance.pk,
            object_str=instance.__str__(),
            object_ctype=sender.__name__
        )
        if hasattr(instance, "user"):
            new_log_entry.user = instance.user
        new_log_entry.save()
