from django.test import TestCase

# IMPORTANT NOTE:
# We cannot make tests in this app.
# It relies on un-managed models, and the test suite cannot spin up test db
# without a managed model. I tried some TEST_RUNNER workarounds to no avail.
