from django.core.management.base import BaseCommand, CommandError
from github import Github
import urllib.request
from django.conf import settings
import csv
import os

from core.models import SourceColumnMap


COLUMNS_META_FILE_NAME = 'meta_columns.csv'
GITHUB_REPO = 'devinit/ddw-data-update-configs'
DATA_FOLDER = 'manual'
LOCAL_DATA_PATH = '/data_updates/'

class Command(BaseCommand):
    help = 'Downloads CSV files from git repo'

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', type=str, default=settings.CSV_FILES_FOLDER)

    def handle(self, *args, **options):
        cwd = os.getcwd()
        destination_path = '{}{}'.format(cwd, LOCAL_DATA_PATH)
        try:
            g = Github(settings.GITHUB_TOKEN)

            repo = g.get_repo(GITHUB_REPO)
            contents = repo.get_contents(DATA_FOLDER)
            while contents:
                file_content = contents.pop(0)
                if file_content.type == "dir":
                    contents.extend(repo.get_contents(file_content.path))
                else:
                    self.stdout.write("Fetching {}".format(file_content.path), ending='\n')
                    self.stdout.flush()
                    urllib.request.urlretrieve(file_content.download_url, destination_path + file_content.path)

                    if COLUMNS_META_FILE_NAME in file_content.path:
                        self.check_column_mapping(options["path"])

                    break;
        except Exception as e:
            raise CommandError(e)

    def check_column_mapping(self, csv_path):
        COLUMNS_META_PATH = os.path.join(csv_path, COLUMNS_META_FILE_NAME)

        columns = SourceColumnMap.objects.all()
        for column in columns:
            source = column.source
            if not self.does_csv_have_matching_column(COLUMNS_META_PATH, source, column):
                # TODO: look for usages of the affected column
                pass

    def does_csv_have_matching_column(self, csv_path, source, column):
        match_found = False
        with open(csv_path) as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if row['active_mirror_name'] == source.active_mirror_name and row['col_name'] == column.name:
                    match_found = True
                    break

        return match_found
