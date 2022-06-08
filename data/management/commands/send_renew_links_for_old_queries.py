from datetime import datetime, timedelta

from django.db import transaction
from django.core.management.base import BaseCommand
from django.conf import settings
from django.urls import reverse
from core.models import FrozenData, Operation, OperationStep, SavedQueryData
from core.pypika_fts_utils import TableQueryBuilder
from core.query import delete_archive
from core.utils import send_emails, QueryResetTokenGenerator
from data.db_manager import run_query


SIX_MONTHS = 365//2
RENEWAL_MESSAGE = ('Your query / archived dataset has gone long without renewal.\n '
                   'Please follow below link to renew or it will be deleted automatically in a week.\n')
QUERY_SUBJECT = 'Query renewal'
ARCHIVE_SUBJECT = 'Frozen data renewal'
DAYS_TO_SEND_TO_PM = 7
DAYS_TO_DELETE = 14
FROZEN_DATASET_SCHEMA = 'dataset'


class Command(BaseCommand):
    help = 'Gets old queries and sends reminders to owners'

    def handle(self, *args, **options):
        self.process_operations(False, QUERY_SUBJECT, RENEWAL_MESSAGE)
        self.process_operations(True, QUERY_SUBJECT, RENEWAL_MESSAGE)

    @transaction.atomic
    def process_operations(renewal_sent=False, subject='', message=''):
        reset_generator = QueryResetTokenGenerator()
        time_difference = SIX_MONTHS
        # This will handle sending to Dean after expiry of 7 days since last one was sent to owner
        if renewal_sent:
            time_difference += DAYS_TO_SEND_TO_PM
        old_operations = Operation.objects.filter(
            last_accessed__lte=datetime.now()-timedelta(days=time_difference)
        ).filter(renewal_sent=renewal_sent).select_related('user')
        processed_operations = []
        for old_operation in old_operations:
            reset_token = reset_generator.make_token(old_operation)
            reset_link = reverse('renewal_view', kwargs={'id': old_operation.id, 'token': reset_token})
            reset_link = f'{settings.BASE_URL}{reset_link}'
            recipients = [user[1] for user in settings.ADMINS]
            if old_operation.user and old_operation.user.username:
                recipients.append(old_operation.user.username)
            subject = f'{subject} ({old_operation})'
            message = f'{message} {reset_link}'
            try:
                send_emails(subject, message, recipients)
                old_operation.renewal_sent = True
                processed_operations.append(old_operation)
            except:
                pass
            Operation.objects.bulk_update(processed_operations, ['renewal_sent'], batch_size=1000)

    @transaction.atomic
    def delete_old_operations():
        time_difference = SIX_MONTHS + DAYS_TO_DELETE
        old_operations = Operation.objects.filter(
            last_accessed__lte=datetime.now()-timedelta(days=time_difference)
        ).filter(renewal_sent=True)
        for old_operation in old_operations:
            try:
                # Delete related steps
                OperationStep.objects.filter(operation_id=old_operation.id).delete()
                # Delete operation
                old_operation.delete()
            except:
                pass

    @transaction.atomic
    def process_frozen_tables():
        pass

    @transaction.atomic
    def delete_old_frozen_sources():
        # Delete from sources table, delete table itself
        time_difference = SIX_MONTHS + DAYS_TO_DELETE
        old_frozen_tables = FrozenData.objects.filter(
            last_accessed__lte=datetime.now()-timedelta(days=time_difference)
        ).filter(renewal_sent=True)
        for frozen_table in old_frozen_tables:
            try:
                delete_archive(frozen_table.id)
            except:
                pass

    @transaction.atomic
    def process_frozen_datasets():
        pass

    @transaction.atomic
    def delete_old_frozen_datasets():
        time_difference = SIX_MONTHS + DAYS_TO_DELETE
        old_frozen_datasets = SavedQueryData.objects.filter(
            last_accessed__lte=datetime.now()-timedelta(days=time_difference)
        ).filter(renewal_sent=True)
        for frozen_dataset in old_frozen_datasets:
            try:

                query_builder = TableQueryBuilder(frozen_dataset.saved_query_db_table, FROZEN_DATASET_SCHEMA)
                delete_sql = query_builder.delete_table(frozen_dataset.saved_query_db_table, FROZEN_DATASET_SCHEMA)
                delete_result = run_query(delete_sql)
                if delete_result[0]['result'] == 'success':
                    frozen_dataset.delete()
            except:
                pass
