from django.test import TestCase

from rest_framework.test import APIClient

class TestRobotTxt(TestCase):
    def test_get(self):
        client = APIClient()
        response = client.get('/robots.txt/', secure=True)
        assert response.status_code == 200
        assert response['content-type'] == 'text/plain'
        lines = response.content.decode().splitlines()
        assert lines[0] == 'User-Agent: *'

    def test_post_disallowed(self):
        client = APIClient()
        response = client.post('/robots.txt/', secure=True)
        assert response.status_code == 405
