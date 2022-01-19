import datetime
import json

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from core.models import ETLQuery, SavedQueryData
from core.pypika_fts_utils import TableQueryBuilder
from data.db_manager import run_query


class Command(BaseCommand):
    help = 'Freezes query dataset after an ETL process has finished'

    def add_arguments(self, parser):
        parser.add_argument('etl_process', nargs='?', type=str, default="IATI")

    def handle(self, *args, **options):
        try:
            etl_query = ETLQuery.objects.filter(etl_process=options["etl_process"], active=True).order_by('-id')[:1]
        except ETLQuery.DoesNotExist:
            raise CommandError("ETLQuery '" + options["etl_process"] + "' does not Exist")

        self.create(etl_query[0])

    def create(self, etl_query: ETLQuery):

        operation = etl_query.query
        saved_query_db_table = "query_data_" + \
            datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        query_builder = TableQueryBuilder(
            saved_query_db_table, operation=operation)
        sql = query_builder.get_sql_without_limit()
        user = User.objects.get(username='root')
        saved_query_data = SavedQueryData(user=user, full_query=sql,
                            saved_query_db_table=saved_query_db_table,
                            operation=operation,
                            status='p',
                            description='Saved Query data automatically created after ' + etl_query.etl_process + ' ETL',
                            created_on=datetime.datetime.now(),
                            logs=''
                            )
        saved_query_data.save()
        old_data_set = etl_query.saved_dataset
        etl_query.saved_dataset = saved_query_data
        etl_query.save()
        create_query = query_builder.create_table_from_query(saved_query_db_table, "dataset")
        create_result = run_query(create_query)
        if create_result[0]['result'] == 'success':
            saved_query_data.status = 'c'
            saved_query_data.logs = 'Success fully created dataset archive'
            saved_query_data.save()
        elif create_result[0]['result'] == 'error':
            saved_query_data.status = 'e'
            saved_query_data.logs = 'Failed to create dataset archive: ' + create_result[0]['message']
            saved_query_data.save()
        else:
            saved_query_data.status = 'e'
            saved_query_data.logs = 'Failed to create dataset archive: ' + json.dumps(create_result)
            saved_query_data.save()

        if old_data_set:
            old_data_set.delete()

