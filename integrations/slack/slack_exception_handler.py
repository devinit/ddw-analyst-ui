import traceback
from urllib import response
from django.http import HttpResponse, Http404
from django.conf import settings
from django.contrib import messages
from django.utils.deprecation import MiddlewareMixin
from django.utils.log import AdminEmailHandler

from .methods import postToSlackChannel

class SlackExceptionHandler(AdminEmailHandler):
    def send_mail(self, subject, message, *args, **kwargs):
        postToSlackChannel(settings.SLACK_CHANNEL_ID, message, subject)

