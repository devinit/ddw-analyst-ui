from django.test import TestCase
from core.models import Tag, AuditLogEntry


class TestAuditLog(TestCase):
    """Test case class for testing functionality of audit log"""
    def test_increment_audit_log(self):
        initial_audit_count = AuditLogEntry.objects.count()
        new_tag = Tag(name="test_tag")
        new_tag.save()
        final_audit_count = AuditLogEntry.objects.count()
        self.assertEqual(initial_audit_count + 1, final_audit_count)
