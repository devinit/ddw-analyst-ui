from datetime import datetime, timedelta

from django.db import transaction
from django.core.management.base import BaseCommand
from django.conf import settings
from django.urls import reverse
from core.models import Operation
from core.utils import send_emails, QueryResetTokenGenerator


SIX_MONTHS = 365//2

class Command(BaseCommand):
    help = 'Gets old queries and sends reminders to owners'

    @transaction.atomic
    def handle(self, *args, **options):
        reset_generator = QueryResetTokenGenerator()
        old_operations = Operation.objects.filter(
            last_accessed__lte=datetime.now()-timedelta(days=SIX_MONTHS)
        ).filter(renewal_sent=False).select_related('user')
        processed_operations = []
        for old_operation in old_operations:
            reset_token = reset_generator.make_token(old_operation)
            reset_link = reverse('renewal_view', kwargs={'id': old_operation.id, 'token': reset_token})
            reset_link = f'{settings.BASE_URL}{reset_link}'
            print(reset_link)
            recipients = [user[1] for user in settings.ADMINS]
            if old_operation.user and old_operation.user.username:
                recipients.append(old_operation.user.username)
            subject = f'Query {old_operation} renewal'
            message = (f'Your query has gone long without renewal. Please follow below link to renew or it will be deleted automatically in a week.\n'
                    f'{reset_link}')
            try:
                send_emails(subject, message, recipients)
                old_operation.renewal_sent = True
                processed_operations.append(old_operation)
            except:
                pass
            Operation.objects.bulk_update(processed_operations, ['renewal_sent'], batch_size=1000)
