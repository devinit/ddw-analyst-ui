from django.core.management.base import BaseCommand
from core.models import Source, SourceColumnMap, Tag
from django.conf import settings
import csv
import os


class Command(BaseCommand):
    help = 'Loads manual datasets as described in meta.csv and meta_columns.csv'

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', type=str, default=settings.CSV_FILES_FOLDER)

    def handle(self, *args, **options):
        meta_path = os.path.join(options["path"], "meta.csv")
        meta_columns_path = os.path.join(options["path"], "meta_columns.csv")

        source_mapping = dict()

        with open(meta_path) as csv_f:
            reader = csv.DictReader(csv_f)
            for row in reader:
                active_mirror_name = row["active_mirror_name"]
                tag_strs = row["tags"].split(",")

                for not_modeled_attr in ["tags", "filename"]:
                    row.pop(not_modeled_attr)
                # Get or create without save first, assuming indicator is unique
                try:
                    source = Source.objects.get(indicator=row["indicator"])
                    for (key, value) in row.items():
                        setattr(source, key, value)
                except Source.DoesNotExist:
                    source = Source(**row)

                source.save()

                for tag_str in tag_strs:
                    tag, _ = Tag.objects.get_or_create(name=tag_str)
                    source.tags.add(tag)

                source_mapping[active_mirror_name] = source

        with open(meta_columns_path) as csv_f:
            reader = csv.DictReader(csv_f)
            for row in reader:
                source = source_mapping[row["active_mirror_name"]]
                source_column_map, _ = SourceColumnMap.objects.get_or_create(source=source, name=row["col_name"])
                source_column_map.source_name = row["col_source_name"]
                source_column_map.description = row["col_description"]
                # source_column_map.data_type = row["data_type"]
                source_column_map.save()
