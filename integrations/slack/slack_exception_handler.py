from django.conf import settings
from django.utils.log import AdminEmailHandler

from .methods import post_to_slack_channel

class SlackExceptionHandler(AdminEmailHandler):
    def send_mail(self, subject, message, *args, **kwargs):
        post_to_slack_channel(settings.SLACK_CHANNEL_ID, message, subject)

