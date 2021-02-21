
from django.conf import settings
from django.core.management.base import BaseCommand

from core.models import Operation, Source
from core.pypika_utils import QueryBuilder
from data.db_manager import analyse_query

class RunCurrentQueries(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('active_mirror_name', type=str, help='Table name where the columns belong')
        parser.add_argument('old_cols', nargs='+', type=str, help='List of old column names')

    def handle(self, *args, **kwargs):
        source = kwargs['active_mirror_name']
        old_cols = kwargs['old_cols']

    def getAllQueries(self):
        return Operation.objects.all()

    def checkAllQueries(self):
        queries = self.getAllQueries()
        for query in queries:
            sql = QueryBuilder(operation=query).get_sql(limit=2)
            results = analyse_query(sql)
            if results[0]['result'] == 'success':
                continue
            else:
                print(sql)
                print("Failed for Operation {} - {} with error {}".format(query.id, query.name, results[0]['error']))


    def getQueriesBySource(self, source):
        return Operation.objects.filter(source=source)

    def getSourceByActiveMirrorName(self, active_mirror_name):
        return Source.objects.filter(active_mirror_name=active_mirror_name)

    def checkQueriesBySource(self, source, old_cols):
        queries = self.getAllQueries()
        for query in queries:
            print('Checking Query {} - {}'.format(query.id, query.name))
            steps = query.operationstep_set.order_by('step_id').all()
            for step in steps:
                # current_source = Source.objects.get(pk=step.source)
                query_func = step.query_func
                query_function = getattr(self, query_func)
                kwargs = json.loads(step.query_kwargs)
                if query_func == 'join':
                    if source == kwargs['table_name']:
                        query_function(**kwargs, right_cols=old_cols)

                current_source = Source.objects.get(pk=step.source)

                if source == current_source.active_mirror_name:
                    query_function(**kwargs, old_cols=old_cols)

    def filter(self, filters, old_cols=[]):
        changed_cols = []
        if len(old_cols) < 1:
            return changed_cols
        for filter in filters:
            if filter['field'] in old_cols:
                changed_cols.append(filter['field'])
                print('Column {} is used by above query'.format(filter['field']))
        return changed_cols

    def select(self, columns=None, old_cols=[]):
        changed_cols = []
        if len(old_cols) < 1 or columns is None:
            return changed_cols
        for column in columns:
            if column in old_cols:
                changed_cols.append(column)
                print('Column {} is used by above query'.format(column))
        return changed_cols

    def join(self, table_name, schema_name, join_on, join_how="full", columns_x=None, columns_y=None, suffix_y="2", old_cols=[], right_cols=[]):
        changed_cols = []
        for k, v in join_on.items():
            if k in old_cols:
                changed_cols.append(k)
                print('Column {} is used by above query'.format(k))
            if v in right_cols:
                changed_cols.append(v)
                print('Column {} is used by above query'.format(v))
        for column_x in columns_x:
            if column_x in old_cols:
                changed_cols.append(column_x)
                print('Column {} is used by above query'.format(column_x))
        for column_y in columns_y:
            if column_x in right_cols:
                changed_cols.append(column_y)
                print('Column {} is used by above query'.format(column_y))

    def scalar_transform(self, trans_func_name, operational_column, operational_value, old_cols=[]):
        if operational_column in old_cols:
            print('Column {} is used by above query'.format(operational_column))

    def multi_transform(self, trans_func_name, operational_columns, old_cols=[]):
        for operational_column in operational_columns:
            if operational_column in old_cols:
                print('Column {} is used by above query'.format(operational_column))

    def window(self, window_fn, term=None, over=None, order_by=None, columns=None, old_cols=[], **kwargs):
        if columns:
            for column in columns:
                if column in old_cols:
                    print('Column {} is used by above query'.format(column))

    def aggregate(self, group_by, agg_func_name, operational_column, old_cols=[]):
        if operational_column in old_cols:
            print('Column {} is used by above query'.format(operational_column))
