from django.core import management

def schedules_cron_job():
    management.call_command("run_schedules")
