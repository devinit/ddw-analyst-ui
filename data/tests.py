from django.core.management import call_command
from django.test import TestCase

# IMPORTANT NOTE:
# We cannot make tests using models in this app.
# It relies on un-managed models, and the test suite cannot spin up test db
# without a managed model. I tried some TEST_RUNNER workarounds to no avail.


class TestCommands(TestCase):
    def test_load_manual(self):
        """Make sure manual load isn't broken"""
        args = list()
        opts = dict()
        call_command('load_manual', *args, **opts)
