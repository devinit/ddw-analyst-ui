import json
from datetime import date, datetime, timedelta
import calendar
import datetime as dtime
import multiprocessing

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
        schedule_has_running_instance = self.check_for_running_instances(schedule)
        if run_instances:
            for run_instance in run_instances:
                if run_instance.status == 'p' and run_instance.start_at <= timezone.now():
                    if schedule_has_running_instance:
                        self.update_run_instance(run_instance, 's')
                    else:
                        # First update instance to "r" then run
                        self.update_run_instance(run_instance, 'r')
                        self.run_and_update_schedule(schedule, run_instance)
        elif not schedule_has_running_instance:
            start_date = timezone.now() if schedule.start_date <= timezone.now() else schedule.start_date
            self.create_next_run_instance(schedule, last_rundate=timezone.now(), start_date=start_date)

    def check_for_running_instances(self, scheduled_event):
        running_instances = ScheduledEventRunInstance.objects.filter(
            Q(scheduled_event=scheduled_event) & Q(status='r')
        ).count()

        return running_instances > 0

    def update_run_instance(self, runInstance, updated_status, logs=None):
        if updated_status != 'p' and updated_status != 'r':
            runInstance.ended_at = make_aware(datetime.now())
        runInstance.status = updated_status
        runInstance.logs = logs
        runInstance.save()

    def run_and_update_schedule(self, schedule, runInstance):
        try:
            expected_runtime = 7200 # 7200 seconds or 2 hours

            #Get average running time of all successfull run instances
            average_instance_runtime_in_seconds = self.calculateAverageInstanceRuntime(schedule)

            if average_instance_runtime_in_seconds is not None:
                expected_runtime = average_instance_runtime_in_seconds
            elif schedule.expected_runtime and schedule.expected_runtime_type in 'min':
                expected_runtime = schedule.expected_runtime * 60
            elif schedule.expected_runtime and schedule.expected_runtime_type in 'sec':
                expected_runtime = schedule.expected_runtime
            elif schedule.expected_runtime and schedule.expected_runtime_type in 'hrs':
                expected_runtime = schedule.expected_runtime * 60 * 60

            #Run the script
            parent_conn, child_conn = multiprocessing.Pipe()
            p = multiprocessing.Process(target=self.execute_script, args=(schedule.script_name, child_conn,))

            #Start process
            p.start()

            #wait until process runs more than timeout
            p.join(timeout=expected_runtime)

            if p.is_alive():
                schedule.alert.alert_long_running_schedule()
                p.join()

            update_response = parent_conn.recv()

            #Check if script run was a success/fail and update run instance
            if update_response['return_code'] != 0:
                self.update_run_instance(runInstance, 'e', update_response['message'])
                self.stdout.write('Script execution failed for ' + schedule.script_name)
            else:
                self.update_run_instance(runInstance, 'c')
                self.stdout.write('Script ran successfully for ' + schedule.script_name)

            # This makes sure the next runtime is calculated from the time the last one was run i.e current time
            current_date_time = make_aware(datetime.now())
            self.create_next_run_instance(schedule, current_date_time)
        except:
            self.update_run_instance(runInstance, 'e', 'An unexpected error occured while executing the script ... please contact the administrator')
            self.create_next_run_instance(schedule, make_aware(datetime.now()))

    def execute_script(self, script_name, child_conn):
        post_status = status.HTTP_200_OK
        executor = ScriptExecutor(script_name)
        stream = executor.stream()
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Script ran successfully'
        response_data['return_code'] = 0
        logs = ''

        for item in stream:
            try:
                # parse stream content - it's mostly returned as bytes
                for content in item:
                    if content:
                        logs += content.decode('utf-8') + '\n'
            except TypeError:
                pass
            pass
        # Check if the last item in generator is an integer
        # The integer is a return code showing 0 for success or anything else for a file execute error
        if item != 0:
            post_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data['result'] = 'error'
            response_data['message'] = 'Script execution failed:\n\n' + logs
            response_data['return_code'] = item

        child_conn.send(response_data)
        child_conn.close()

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
            self.stdout.write('Next run instance created for ' + schedule.name)

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

    def calculateAverageInstanceRuntime(self, schedule):
        instances = ScheduledEventRunInstance.objects.filter(
            Q(scheduled_event=schedule.id) & Q(status='c')
        )
        timedeltas = []
        if instances:
            for instance in instances:
                timedeltas.append(instance.ended_at - instance.start_at)
            average_timedelta = sum(timedeltas, timedelta(0)) / len(timedeltas)
            return int(average_timedelta.total_seconds())
        return None
