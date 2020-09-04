import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ddw_analyst_ui.settings')

app = Celery('ddw_analyst_ui')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
