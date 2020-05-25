# Create your tasks here
from __future__ import absolute_import, unicode_literals
from .utils import RequestHelper
from celery import shared_task

@shared_task
def execute_script(script_name):
    requestHelper = RequestHelper()
    return requestHelper.execute_update(script_name)
