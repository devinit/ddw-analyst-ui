import json
from datetime import date, datetime, timedelta
import calendar
import datetime as dtime

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.http import HttpResponse, StreamingHttpResponse
from django.utils.timezone import make_aware
from django.utils import timezone
from rest_framework import status

from core.models import ScheduledEvent, ScheduledEventRunInstance
from data_updates.utils import ScriptExecutor

from dateutil.relativedelta import *


class Command(BaseCommand):
    help = 'Executes scheduled events at their appointed time'

    def handle(self, *args, **kwargs):
        schedules = ScheduledEvent.objects.filter(enabled=True)
        for schedule in schedules:
            run_instances = ScheduledEventRunInstance.objects.filter(
                Q(scheduled_event=schedule.id) & Q(status='p')
            )
            self.run_schedule_when_due(schedule, run_instances)

    def run_schedule_when_due(self, schedule, run_instances):
        if run_instances:
            for run_instance in run_instances:
                if self.check_status_of_instance(run_instance, 'p') and run_instance.start_at <= timezone.now():
                    if self.check_if_schedule_is_already_running(run_instance):
                        self.update_run_instance(run_instance, 's')
                    else:
                        # First update instance to "r" then run
                        self.update_run_instance(run_instance, 'r')
                        self.run_and_update_schedule(schedule, run_instance)
        else:
            start_date = timezone.now() if schedule.start_date <= timezone.now() else schedule.start_date
            self.create_next_run_instance(schedule, last_rundate=timezone.now(), start_date=start_date)

    def check_status_of_instance(self, run_instance, status):
        run_instance = ScheduledEventRunInstance.objects.get(pk=run_instance.id)
        if run_instance.status == status:
            return True
        return False

    def check_if_schedule_is_already_running(self, run_instance):
        running_instances = ScheduledEventRunInstance.objects.filter(
            Q(scheduled_event=run_instance.scheduled_event) & Q(status='r')
        ).count()
        if running_instances > 0:
            return True
        return False

    def update_run_instance(self, runInstance, updated_status, logs=None):
        runInstance.ended_at = make_aware(datetime.now())
        runInstance.status = updated_status
        runInstance.logs = logs
        runInstance.save()

    def run_and_update_schedule(self, schedule, runInstance):
        try:
            #Run the script
            update_response = self.execute_script(schedule.script_name)

            #Check if script run was a success/fail and update run instance
            if update_response['return_code'] != 0:
                self.update_run_instance(runInstance, 'e')
                self.stdout.write('Script execution failed for ' + schedule.script_name)
            else:
                self.update_run_instance(runInstance, 'c')
                self.stdout.write('Script ran successfully for ' + schedule.script_name)

            # This makes sure the next runtime is calculated from the time the last one was run i.e current time
            current_date_time = make_aware(datetime.now())
            self.create_next_run_instance(schedule, current_date_time)
        except:
            self.update_run_instance(runInstance, 'e', 'An unexpected error occured while executing the script ... please contact the administrator')

    def execute_script(self, script_name):
        post_status = status.HTTP_200_OK
        executor = ScriptExecutor(script_name)
        stream = executor.stream()
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Script ran successfully'
        response_data['return_code'] = 0

        for item in stream:
            pass
        # Check if the last item in generator is an integer
        # The integer is a return code showing 0 for success or anything else for a file execute error
        if item != 0:
            post_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data['result'] = 'error'
            response_data['message'] = 'Failed to execute the script update'
            response_data['return_code'] = item

        return response_data

    def create_next_run_instance(self, schedule, last_rundate, start_date=None):
        if schedule.repeat:
            #Create future run instance if schedule has been repeated
            nextRunInstance = ScheduledEventRunInstance(
                scheduled_event = schedule,
                start_at = self.calculate_next_runtime(
                    last_rundate,
                    schedule.interval,
                    schedule.interval_type
                ) if not start_date else start_date,
                status = 'p'
            )
            nextRunInstance.save()
            self.stdout.write('Pending run instance created')

    def calculate_next_runtime(self, last_rundate, interval, interval_type):
        if interval_type and interval_type in 'min':
            return last_rundate + relativedelta(minutes=+interval)
        elif interval_type and interval_type in 'sec':
            return last_rundate + relativedelta(seconds=+interval)
        elif interval_type and interval_type in 'hrs':
            return last_rundate + relativedelta(hours=+interval)
        elif interval_type and interval_type in 'dys':
            return last_rundate + relativedelta(days=+interval)
        elif interval_type and interval_type in 'wks':
            return last_rundate + relativedelta(weeks=+interval)
        elif interval_type and interval_type in 'mnt':
            return last_rundate + relativedelta(months=+interval)
        elif interval_type and interval_type in 'yrs':
            return last_rundate + relativedelta(years=+interval)
