import json
from datetime import date, datetime, timedelta

from django.core.management.base import BaseCommand
from django.http import HttpResponse, StreamingHttpResponse
from django.utils.timezone import make_aware
from rest_framework import status

from core.models import ScheduledEvent, ScheduledEventRunInstance
from data_updates.utils import ScriptExecutor


class Command(BaseCommand):
    help = 'Executes scheduled events at their appointed time'

    def calculate_interval_counts(self, run_instances, interval, interval_type):
        counts = {}
        counts['daily_count'] = 0
        counts['minute_count'] = 0
        counts['second_count'] = 0
        counts['hour_count'] = 0
        counts['weekly_count'] = 0
        counts['monthly_count'] = 0
        counts['annual_count'] = 0

        now = make_aware(datetime.now())
        for run_instance in run_instances:
            set_date = run_instance.start_at
            if interval_type and interval_type in 'min':
                if now-timedelta(seconds=60) <= set_date <= now:
                    counts['minute_count'] = counts['minute_count'] + 1
                    print('duration in minutes - minute_count')
                    print(counts['minute_count'])
            elif interval_type and interval_type in 'sec':
                if now-timedelta(seconds=1) <= set_date <= now:
                    counts['second_count'] = counts['second_count'] + 1
                    print('duration in seconds - second_count')
                    print(counts['second_count'])
            elif interval_type and interval_type in 'hrs':
                if now-timedelta(hours=1) <= set_date <= now:
                    counts['hour_count'] = counts['hour_count'] + 1
                    print('duration in hours - hour_count')
                    print(counts['hour_count'])
            elif interval_type and interval_type in 'dys':
                if now-timedelta(hours=24) <= set_date <= now:
                    counts['daily_count'] = counts['daily_count'] + 1
                    print('duration in days - daily_count')
                    print(counts['daily_count'])
            elif interval_type and interval_type in 'wks':
                if now-timedelta(weeks=1) <= set_date <= now:
                    counts['weekly_count'] = counts['weekly_count'] + 1
                    print('duration in weeks - weekly_count')
                    print(counts['weekly_count'])
            elif interval_type and interval_type in 'mnt':
                if now-timedelta(weeks=4) <= set_date <= now:
                    counts['monthly_count'] = counts['monthly_count'] + 1
                    print('duration in months - monthly_count')
                    print(counts['monthly_count'])
            elif interval_type and interval_type in 'yrs':
                set_date_year = int(set_date.strftime('%Y'))
                current_year = int(now.strftime('%Y'))

                if set_date_year == current_year:
                    counts['annual_count'] = counts['annual_count'] + 1
                    print('duration in years - annual_count')
                    print(counts['annual_count'])
        return counts

    def check_if_repeat_is_due(self, interval, interval_type, run_instances):
        counts = self.calculate_interval_counts(run_instances, interval, interval_type)

        if interval_type and interval_type in 'yrs':
            if counts['annual_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'mnt':
            if counts['monthly_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'wks':
            if counts['weekly_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'dys':
            if counts['daily_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'hrs':
            if counts['hourly_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'min':
            if counts['minute_count'] < int(interval):
                return True
        elif interval_type and interval_type in 'sec':
            if counts['second_count'] < int(interval):
                return True
        else:
            return False

    def manage_repeated_schedules(self, schedule, run_instances):
        if schedule.repeat:
            return self.check_if_repeat_is_due(schedule.interval, schedule.interval_type, run_instances)
        else:
            return False

    def check_if_schedule_is_due(self, schedule, run_instances):
        if run_instances.count() <= 0:
            # If the count of run instances is zero, return true because the schedule has never been run
            return True
        elif run_instances.count() > 0:
            for run_instance in run_instances:
                if run_instance.ended_at is None:
                    # If ended_at is null return false because there's a run instance in progress
                    return False
            if self.manage_repeated_schedules(schedule, run_instances):
                return True
            else:
                return False

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

    def handle(self, *args, **kwargs):
        schedules = ScheduledEvent.objects.filter(enabled=True)
        for schedule in schedules:
            run_instances = ScheduledEventRunInstance.objects.filter(scheduled_event=schedule.id)
            if self.check_if_schedule_is_due(schedule, run_instances):

                #Create run instance
                runInstance = ScheduledEventRunInstance(
                    scheduled_event = schedule,
                    start_at = make_aware(datetime.now()),
                    status = 'r'
                )
                runInstance.save()
                self.stdout.write('Run instance created')

                #Run the script
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
