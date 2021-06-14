from django.conf import settings
from django.core.management.base import BaseCommand

from core.models import Operation
from core.pypika_utils import QueryBuilder
from core import query

class Command(BaseCommand):

    def add_arguments(self, parser):
        # parser.add_argument('active_mirror_name', type=str, help='Table name where the columns belong')
        parser.add_argument('-a', '--all', action='store_true', help='Default - Used if you want to update all current queries')

    def handle(self, *args, **kwargs):
        all = kwargs['all']

def updateAllQueries(self):
        operations = Operation.objects.all()
        for operation in operations:
            try:
                estimate = query.querytime_estimate(operation=operation)
                if estimate[0]['result'] == 'success':
                    operation.estimated_run_time = int(estimate[0]['message'])
                    operation.save()
                    self.stdout.write(self.style.SUCCESS("Done for {} - {}".format(operation.id, operation.name)))
                else:
                    self.stdout.write(self.style.ERROR("Failed for Operation {} - {} with error {}".format(operation.id, operation.name, results[0]['message'])))
                    # input('Press Enter to continue...')
            except AttributeError as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with attribute error {}'.format(operation.id, operation.name, error)))
            except TypeError as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with type error {}'.format(operation.id, operation.name, error)))
            except Exception as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with error {}'.format(operation.id, operation.name, error)))

def updateById(self, id):
        operations = Operation.objects.filter(id__in=[id])
        for operation in operations:
            try:
                estimate = query.querytime_estimate(operation=operation)
                if estimate[0]['result'] == 'success':
                    operation.estimated_run_time = int(estimate[0]['message'])
                    operation.save()
                    self.stdout.write(self.style.SUCCESS("Done for {} - {}".format(operation.id, operation.name)))
                else:
                    self.stdout.write(self.style.ERROR("Failed for Operation {} - {} with error {}".format(operation.id, operation.name, results[0]['message'])))
                    # input('Press Enter to continue...')
            except AttributeError as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with attribute error {}'.format(operation.id, operation.name, error)))
            except TypeError as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with type error {}'.format(operation.id, operation.name, error)))
            except Exception as error:
                self.stdout.write(self.style.NOTICE('Failed for Operation {} - {} with error {}'.format(operation.id, operation.name, error)))
