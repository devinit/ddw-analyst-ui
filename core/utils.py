from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mass_mail
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.http import base36_to_int, int_to_base36

from core.models import Operation


class QueryResetTokenGenerator(PasswordResetTokenGenerator):
    """
    Strategy object used to generate and check tokens for the Query last_accessed
    reset mechanism.
    """
    key_salt = "django.contrib.auth.tokens.PasswordResetTokenGenerator"
    algorithm = None
    secret = None

    def __init__(self):
        self.secret = settings.SECRET_KEY
        self.algorithm = 'sha256'

    def make_token(self, operation: Operation):
        """
        Return a token that can be used once to do a query reset for given query.
        """
        return self._make_token_with_timestamp(operation, self._num_seconds(self._now()))

    def check_token(self, operation, token):
        """
        Check that an update token is correct for a given Query.
        """
        if not (operation and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        if not constant_time_compare(self._make_token_with_timestamp(operation, ts), token):
            return False
        now = self._now()
        # Check the timestamp is within limit.
        if (self._num_seconds(now) - ts) > settings.PASSWORD_RESET_TIMEOUT:
            return False

        return True

    def _make_token_with_timestamp(self, operation, timestamp, legacy=False):
        # timestamp is number of seconds since 2001-1-1. Converted to base 36,
        # this gives us a 6 digit string until about 2069.
        ts_b36 = int_to_base36(timestamp)
        hash_string = salted_hmac(
            self.key_salt,
            self._make_hash_value(operation, timestamp),
            secret=self.secret,
            algorithm=self.algorithm,
        ).hexdigest()[::2]  # Limit to shorten the URL.
        return "%s-%s" % (ts_b36, hash_string)

    def _make_hash_value(self, operation, timestamp):
        """
        Hash the query's primary key, and some query state
        that's sure to change after a password reset to produce a token that is
        invalidated when it's used:
        1. The last_accessed field will usually be updated when link is clicked.
        Failing those things, settings.PASSWORD_RESET_TIMEOUT eventually
        invalidates the token.
        Running this data through salted_hmac() prevents update link cracking
        attempts using the reset token, provided the secret isn't compromised.
        """
        # Truncate microseconds so that tokens are consistent even if the
        # database doesn't support microseconds.
        last_accessed = '' if operation.last_accessed is None else operation.last_accessed.replace(microsecond=0, tzinfo=None)
        return f'{operation.pk}{last_accessed}{timestamp}'


def send_emails(subject, message, recipient_list):
    message_payload = (subject, message, settings.EMAIL_HOST_USER, recipient_list)
    send_mass_mail((message_payload, ), fail_silently=False)
