
from django.conf import settings
from django.core.management.base import BaseCommand

from core.models import Operation, Source
from core.pypika_utils import QueryBuilder
from data.db_manager import analyse_query
# from Exception import AttributeError

import json

class Command(BaseCommand):

    def add_arguments(self, parser):
        # parser.add_argument('active_mirror_name', type=str, help='Table name where the columns belong')
        parser.add_argument('old_cols', nargs='+', type=str, help='List of old column names')
        parser.add_argument('-t', '--table', type=str, help='Table name where the columns belong')
        parser.add_argument('-a', '--all', action='store_true', help='Used if you want to run test on all current queries')

    def handle(self, *args, **kwargs):
        source = kwargs['table']
        old_cols = kwargs['old_cols']
        all = kwargs['all']

        if all:
            self.checkAllQueries()

        if source and len(old_cols) > 0:
            self.checkQueriesBySource(source, old_cols)

    def checkAllQueries(self):
        queries = Operation.objects.all()
        for query in queries:
            print(query.id)
            sql = QueryBuilder(operation=query).get_sql(limit=2)
            results = analyse_query(sql)
            if results[0]['result'] == 'success':
                continue
            else:
                self.stdout.write(self.style.ERROR("Failed for Operation {} - {} with error {}".format(query.id, query.name, results[0]['error'])))
                input('Press Enter to continue...')

    def checkQueriesBySource(self, source, old_cols):
        queries = Operation.objects.all()
        for query in queries:
            self.stdout.write(self.style.SUCCESS('Checking Query {} - {}'.format(query.id, query.name)))
            steps = query.operationstep_set.order_by('step_id').all()
            for step in steps:
                try:
                    query_func = step.query_func
                    query_function = getattr(self, query_func)
                    kwargs = json.loads(step.query_kwargs)
                    if query_func == 'join':
                        if source == kwargs['table_name']:
                            query_function(**kwargs, right_cols=old_cols)

                    current_source = step.source.active_mirror_name

                    if source == current_source:
                        query_function(**kwargs, old_cols=old_cols)
                except AttributeError as error:
                    self.stdout.write(self.style.NOTICE('Error {} - The method may not yet be implemented in this Command'.format(error)))

    def filter(self, filters, old_cols=[]):
        changed_cols = []
        if len(old_cols) < 1:
            return changed_cols
        for filter in filters:
            if filter['field'] in old_cols:
                changed_cols.append(filter['field'])
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(filter['field'])))
                input('Press Enter to continue...')
        return changed_cols

    def select(self, columns=None, old_cols=[]):
        changed_cols = []
        if len(old_cols) < 1 or columns is None:
            return changed_cols
        for column in columns:
            if column in old_cols:
                changed_cols.append(column)
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(column)))
                input('Press Enter to continue...')
        return changed_cols

    def join(self, table_name, schema_name, join_on, join_how="full", columns_x=None, columns_y=None, suffix_y="2", old_cols=[], right_cols=[]):
        changed_cols = []
        for k, v in join_on.items():
            if k in old_cols:
                changed_cols.append(k)
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(k)))
                input('Press Enter to continue...')
            if v in right_cols:
                changed_cols.append(v)
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(v)))
                input('Press Enter to continue...')
        for column_x in columns_x:
            if column_x in old_cols:
                changed_cols.append(column_x)
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(column_x)))
                input('Press Enter to continue...')
        for column_y in columns_y:
            if column_x in right_cols:
                changed_cols.append(column_y)
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(column_y)))
                input('Press Enter to continue...')

    def scalar_transform(self, trans_func_name, operational_column, operational_value, old_cols=[]):
        if operational_column in old_cols:
            self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(operational_column)))
            input('Press Enter to continue...')

    def multi_transform(self, trans_func_name, operational_columns, old_cols=[]):
        for operational_column in operational_columns:
            if operational_column in old_cols:
                self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(operational_column)))
                input('Press Enter to continue...')

    def window(self, window_fn, term=None, over=None, order_by=None, columns=None, old_cols=[], **kwargs):
        if columns:
            for column in columns:
                if column in old_cols:
                    self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(column)))
                    input('Press Enter to continue...')

    def aggregate(self, group_by, agg_func_name, operational_column, old_cols=[]):
        if operational_column in old_cols:
            self.stdout.write(self.style.ERROR('Column {} is used by above query'.format(operational_column)))
            input('Press Enter to continue...')
