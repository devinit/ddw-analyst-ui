from django.core.management import call_command
from django.test import TestCase

from django.conf import settings
import os
import csv
import glob


# IMPORTANT NOTE:
# We cannot make tests using models in this app.
# It relies on un-managed models, and the test suite cannot spin up test db
# without a managed model. I tried some TEST_RUNNER workarounds to no avail.


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
