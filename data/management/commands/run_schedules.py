import json
from datetime import date, datetime, timedelta
import calendar
import datetime as dtime

from django.core.management.base import BaseCommand
from django.http import HttpResponse, StreamingHttpResponse
from django.utils.timezone import make_aware
from rest_framework import status

from core.models import ScheduledEvent, ScheduledEventRunInstance
from data_updates.utils import ScriptExecutor

from dateutil.relativedelta import *


class Command(BaseCommand):
    help = 'Executes scheduled events at their appointed time'

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

    def create_next_run_instance(self, schedule, last_rundate):
        if schedule.repeat:
            #Create future run instance if schedule has been repeated
            nextRunInstance = ScheduledEventRunInstance(
                scheduled_event = schedule,
                start_at = self.calculate_next_runtime(
                    last_rundate,
                    schedule.interval,
                    schedule.interval_type
                ),
                status = 'p'
            )
            nextRunInstance.save()
            self.stdout.write('Pending run instance created')

    def execute_script(self, script_name):
        post_status = status.HTTP_200_OK
        executor = ScriptExecutor(script_name)
        stream = executor.stream()
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Script update success'

        for item in stream:
            pass
        # Check if the last item in generator is an integer
        # The integer is a return code showing 0 for success or anything else for a file execute error
        if item > 0 or item < 0:
            post_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data['result'] = 'error'
            response_data['message'] = 'Failed to execute the script update'
            response_data['return_code'] = item

        return response_data

    def run_and_update_schedule(self, schedule, runInstance):
        #Run the script
        print('running script')
        print(schedule.script_name)
        update_response = self.execute_script(schedule.script_name)

        #Check if script run was a success/fail and update run instance
        if update_response['return_code'] > 0 or update_response['return_code'] < 0:
            ScheduledEventRunInstance.objects.filter(pk=runInstance.id).update(
                ended_at=make_aware(datetime.now()),
                status = 'e'
            )
            self.stdout.write('Update failed for ' + schedule.script_name)
        else:
            ScheduledEventRunInstance.objects.filter(pk=runInstance.id).update(
                ended_at=make_aware(datetime.now()),
                status = 'c'
            )
            self.stdout.write('Update successful for ' + schedule.script_name)

        self.create_next_run_instance(schedule, runInstance.start_at)

    def check_if_schedule_is_already_running(self, run_instances):
        for run_instance in run_instances:
            if run_instance.status == 'r':
                return True
        return False

    def run_schedule_if_due(self, schedule, run_instances):
        for run_instance in run_instances:
            if run_instance.status == 'p' and run_instance.start_at <= make_aware(datetime.now()):
                self.run_and_update_schedule(schedule, run_instance)

    def handle(self, *args, **kwargs):
        schedules = ScheduledEvent.objects.filter(enabled=True)
        for schedule in schedules:
            self.calculate_next_runtime(schedule.start_date, schedule.interval, schedule.interval_type)
            run_instances = ScheduledEventRunInstance.objects.filter(scheduled_event=schedule.id)
            if not self.check_if_schedule_is_already_running(run_instances):
                self.run_schedule_if_due(schedule, run_instances)
