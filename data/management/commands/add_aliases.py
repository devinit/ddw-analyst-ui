import os
import csv
import re

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from core.models import SourceColumnMap


class Command(BaseCommand):
    help = 'Updates SourceColumnMap objects with aliases from the meta_columns.csv'

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', type=str, default=settings.CSV_FILES_FOLDER)

    def handle(self, *args, **options):
        self.add_alias_from_csv(options["path"])
        self.generate_missing_alias_from_column_name()

    def add_alias_from_csv(self, path):
        meta_columns_path = os.path.join(path, "meta_columns.csv")

        with open(meta_columns_path) as meta_file:
            reader = csv.DictReader(meta_file)

            for row in reader:
                columns = SourceColumnMap.objects.filter(name=row['col_name'], source__active_mirror_name=row['active_mirror_name'])
                if len(columns):
                    column = columns[0]
                    column.alias = row['col_alias']
                    column.save()

    def generate_missing_alias_from_column_name(self):
        columns = SourceColumnMap.objects.filter(alias__isnull=True)
        for column in columns:
            column.alias = self.generateAlias(column.name)
            column.save()

    def generateAlias(self, name):
        if '_' in name:
            return ' '.join(self.capitaliseFirstListItem(name.split('_')))
        return self.splitCamelCase(name)

    def splitCamelCase(self, name):
        return ' '.join(self.capitaliseFirstListItem(re.sub('([A-Z][a-z]+)', r' \1', re.sub('([A-Z]+)', r' \1', name)).split()))

    def capitaliseFirstListItem(self, my_list):
        my_list[0] = my_list[0].capitalize()

        return my_list
