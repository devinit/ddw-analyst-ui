from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Tag, AuditLogEntry
from rest_framework.test import APIClient

TEST_USER = "test_user"
TEST_PASS = "test_password"


class TestAuditLog(TestCase):
    """Test case class for testing functionality of audit log"""
    def setUp(self):
        self.user = User.objects.create_user(TEST_USER, 'test@test.test', TEST_PASS)

    def test_increment_audit_log(self):
        initial_audit_count = AuditLogEntry.objects.count()
        Tag.objects.create(name="test_tag", user=self.user)
        final_audit_count = AuditLogEntry.objects.count()
        self.assertEqual(initial_audit_count + 1, final_audit_count)


class TestRestFramework(TestCase):
    """Test case class for testing functionality of REST framework"""
    def setUp(self):
        self.user = User.objects.create_superuser(TEST_USER, 'test@test.test', TEST_PASS)
        self.user_tag = Tag.objects.create(name="user_tag", user=self.user)
        self.not_user_tag = Tag.objects.create(name="not_user_tag")

    def test_get_tags_unauthenticated(self):
        client = APIClient()
        response = client.get('/api/tags/')
        assert response.status_code == 401

    def test_get_tags_authenticated(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/api/tags/')
        assert response.status_code == 200

    def test_non_owner_cannot_delete_tag(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.delete('/api/tags/{}/'.format(self.not_user_tag.pk))
        assert response.status_code == 403

    def test_owner_can_delete_tag(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.delete('/api/tags/{}/'.format(self.user_tag.pk))
        assert response.status_code == 204
