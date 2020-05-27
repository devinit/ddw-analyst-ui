import json
from django.core.management.base import BaseCommand
from datetime import date, datetime
from core.models import ScheduledEvent, ScheduledEventRunInstance
from data_updates.utils import ScriptExecutor
from django.http import StreamingHttpResponse
from rest_framework import status
from django.http import HttpResponse
from django.utils.timezone import make_aware


class Command(BaseCommand):
    help = 'Executes scheduled events at their appointed time'

    def check_if_repeat_is_due(self, instance_start_date, interval, interval_type):
        year = int(instance_start_date.strftime('%Y'))
        month = int(instance_start_date.strftime('%m'))
        day = int(instance_start_date.strftime('%d'))
        hour = int(instance_start_date.strftime('%H'))
        minute = int(instance_start_date.strftime('%M'))
        instance_start_date_str = datetime(year, month, day, hour, minute)

        now  = datetime.now()
        duration = now - instance_start_date_str
        duration_in_s = duration.total_seconds()

        if interval_type and interval_type in 'min':
            minutes = divmod(duration_in_s, 60)[0]
            print('duration in mins')
            print(minutes)
            if int(minutes) >= int(interval):
                return True
        elif interval_type and interval_type in 'sec':
            print('duration in secs')
            print(duration_in_s)
            if int(duration_in_s) >= int(interval):
                return True
        elif interval_type and interval_type in 'hrs':
            duration_in_hours = divmod(duration_in_s, 3600)[0]
            print('duration in hours')
            print(duration_in_hours)
            if int(duration_in_hours) >= int(interval):
                return True
        elif interval_type and interval_type in 'dys':
            days  = divmod(duration_in_s, 86400)[0]
            print('duration in days')
            print(days)
            print(interval)
            if int(days) >= int(interval):
                print('true days')
                return True
        elif interval_type and interval_type in 'wks':
            days  = divmod(duration_in_s, 86400)[0]
            weeks = days/7
            print('duration in weeks')
            print(weeks)
            if int(weeks) >= int(interval):
                return True
        elif interval_type and interval_type in 'mnt':
            months  = divmod(duration_in_s, 2629746)[0]
            print('duration in months')
            print(months)
            if int(months) >= int(interval):
                return True
        elif interval_type and interval_type in 'yrs':
            years  = divmod(duration_in_s, 31536000)[0]
            print('duration in years')
            print(years)
            if int(years) >= int(interval):
                return True
        else:
            return False

    def manage_repeated_schedules(self, schedule, run_instances):
        if schedule.repeat:
            latest_run_instance = ScheduledEventRunInstance.objects.filter(scheduled_event=schedule.id).latest('start_at')
            return self.check_if_repeat_is_due(latest_run_instance.start_at, schedule.interval, schedule.interval_type)
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
