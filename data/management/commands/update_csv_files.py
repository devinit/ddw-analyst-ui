import csv
import os
import urllib.request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from github import Github

from core.models import OperationStep, SourceColumnMap

COLUMNS_META_FILE_NAME = 'meta_columns.csv'
GITHUB_REPO = 'devinit/ddw-data-update-configs'
DATA_FOLDER = 'manual'
LOCAL_DATA_PATH = '/data_updates/'

class Command(BaseCommand):
    help = 'Downloads CSV files from git repo'

    def add_arguments(self, parser):
        parser.add_argument('-b', '--branch', type=str, default='master', help='Branch we shall load CSVs from')
        parser.add_argument('path', nargs='?', type=str, default=settings.CSV_FILES_FOLDER)
        parser.add_argument('--validate', action='store_true', help='Validate changes & alert affected objects')

    def handle(self, *args, **options):
        cwd = os.getcwd()
        destination_path = '{}{}'.format(cwd, LOCAL_DATA_PATH)
        branch_name = options['branch']

        try:
            g = Github(settings.GITHUB_TOKEN)

            repo = g.get_repo(GITHUB_REPO)
            branch = repo.get_branch(branch=branch_name)
            contents = repo.get_contents(DATA_FOLDER, ref=branch.commit.sha)
            while contents:
                file_content = contents.pop(0)
                if file_content.type == "dir":
                    contents.extend(repo.get_contents(file_content.path, ref=branch.commit.sha))
                else:
                    self.stdout.write("Fetching {}".format(file_content.path), ending='\n')
                    self.stdout.flush()
                    urllib.request.urlretrieve(file_content.download_url, destination_path + file_content.path)

                    if options['validate'] and COLUMNS_META_FILE_NAME in file_content.path:
                        self.stdout.write("Checking columns...", ending='\n')
                        self.check_column_mapping(options["path"])
        except Exception as e:
            raise CommandError(e)

    def check_column_mapping(self, csv_path):
        COLUMNS_META_PATH = os.path.join(csv_path, COLUMNS_META_FILE_NAME)

        columns = SourceColumnMap.objects.all()
        for column in columns:
            source = column.source
            if not self.does_csv_have_matching_column(COLUMNS_META_PATH, source, column):
                self.update_affected_columns(source, column)

    def does_csv_have_matching_column(self, csv_path, source, column):
        match_found = False
        with open(csv_path) as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if row['active_mirror_name'] == source.active_mirror_name and row['col_name'] == column.name:
                    match_found = True
                    break

        return match_found

    def update_affected_columns(self, source, column):
        steps = OperationStep.objects.filter(source=source.id, query_kwargs__contains=column.name)
        if steps.count():
            self.stdout.write("{} steps found using the obsolete {} column in the {} table".format(
                steps.count(), column.name, source.active_mirror_name), ending='\n')
        for step in steps:
            operation = step.operation
            columns = operation.logs.get('columns', []) if operation.logs else []
            if not column.name in columns:
                columns.append(column.name)
            steps = operation.logs.get('steps', []) if operation.logs else []
            if not step.step_id in steps:
                steps.append(step.step_id)
            operation.logs = {
                'type': 'warning',
                'message': 'Obsolete Columns',
                'columns': columns,
                'steps': steps
            }
            operation.save()

            step_columns = step.logs.get('columns', []) if step.logs else []
            if not column.name in step_columns:
                step_columns.append(column.name)
            step.logs = {
                'type': 'warning',
                'message': 'Obsolete Columns',
                'columns': step_columns
            }
            step.save()
