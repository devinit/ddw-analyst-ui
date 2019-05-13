from django.core.management import call_command
from django.test import TestCase
from data.db_manager import fetch_data
from core.models import Operation, OperationStep
from django.db import connections

from django.conf import settings
import os
import csv
import glob


class TestFixtureData(TestCase):
    """Test case class for testing fixture data"""
    fixtures = ['test_data', 'test_datasets']

    def setUp(self):
        self.op = Operation.objects.create(
            name="Test operation",
            operation_query="Test query",
            theme_id=1
        )
        OperationStep.objects.create(
            operation=self.op,
            step_id=1,
            name="Select",
            query_func="select",
            query_kwargs="{}",
            source_id=1
        )

    def test_can_generate_select_all(self):
        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(len(dat[0].keys()), 88)


    def test_can_generate_select_by_column(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Select",
            query_func="select",
            query_kwargs="{ \"columns\": [ \"year\" ] }",
            source_id=1
        )
        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0].keys(), ["year"])


class TestCommands(TestCase):
    def test_load_manual(self):
        """Make sure manual load isn't broken"""
        args = list()
        opts = dict()
        call_command('load_manual', *args, **opts)


class TestMetadataConstruction(TestCase):
    def test_metadata_isnt_malformed(self):
        """Metadata formation sense check"""
        all_csvs = glob.glob(os.path.join(settings.CSV_FILES_FOLDER, "*.csv"))
        all_csv_bases = [os.path.basename(csv_file) for csv_file in all_csvs]
        meta_path = os.path.join(settings.CSV_FILES_FOLDER, "meta.csv")
        meta_columns_path = os.path.join(settings.CSV_FILES_FOLDER, "meta_columns.csv")

        source_mapping = dict()

        # All files referenced in metadata actually exist
        with open(meta_path) as csv_f:
            reader = csv.DictReader(csv_f)
            for row in reader:
                file_name = row["filename"]
                active_mirror_name = row["active_mirror_name"]
                source_mapping[active_mirror_name] = True

                if file_name:
                    self.assertTrue(file_name in all_csv_bases)

        # All tables referenced in meta columns are referenced in metadata
        with open(meta_columns_path) as csv_f:
            reader = csv.DictReader(csv_f)
            for row in reader:
                self.assertTrue(source_mapping[row["active_mirror_name"]])

        # All CSVs in the folder are referenced in metadata
        source_list = source_mapping.keys()
        for csv_base in all_csv_bases:
            active_mirror_name = os.path.splitext(csv_base)[0]
            if active_mirror_name not in ["meta", "meta_columns"]:
                self.assertTrue(active_mirror_name in source_list)
