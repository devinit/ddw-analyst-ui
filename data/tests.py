from django.core.management import call_command
from django.test import TestCase
from data.db_manager import fetch_data
from core.models import Operation, OperationStep

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
        self.assertEqual(len(dat[0].keys()), 1)

    def test_can_generate_filter(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Filter",
            query_func="filter",
            query_kwargs='{"filters":[{"field":"year", "value":1973, "func":"ge"},{"field":"short_description", "value":"%sector%|%wheat%", "func":"text_search"}]}',
            source_id=1
        )
        queries = self.op.build_query()
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(len(dat), 41)

    def test_can_generate_join(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"year":"year"}}',
            source_id=2
        )
        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(len(dat[0].keys()), 100)

    def test_can_generate_join_for_specific_columns(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"year":"year"},\
            "columns_x":["donor_name","usd_commitment"],"columns_y":["part_code","part_name"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(len(dat[0].keys()), 90)

    def test_can_sum(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue('usd_commitment_Sum' in dat[0].keys())

    def test_can_sum_from_joined_column_passes(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"year":"year"}\
            ,"columns_x":["donor_name","usd_commitment"],"columns_y":["part_code","part_name"]}',
            source_id=2
        )

        OperationStep.objects.create(
            operation=self.op,
            step_id=3,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["part_name"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]['usd_commitment_Sum'] > 150)

    def test_can_generate_perform_ntile(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window Ntile',
            query_func='window',
            query_kwargs='{"window_fn":"NTile","term":4,"order_by":["usd_commitment"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(dat[0]["ntile"], 1)

    def test_can_generate_perform_dense_rank(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window denserank',
            query_func='window',
            query_kwargs='{"window_fn":"DenseRank","order_by":["usd_commitment"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(dat[0]["dense_rank"], 1)

    def test_can_perform_first_value(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window first val',
            query_func='window',
            query_kwargs='{"window_fn":"FirstValue","term":"usd_commitment","order_by":["year"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]['first_value'] > 0)

    def test_can_perform_last_value(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window last val',
            query_func='window',
            query_kwargs='{"window_fn":"LastValue","term":"usd_commitment","order_by":["year"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]['last_value'] > 14)

    # function median(numeric) does not exist

    # def test_can_perform_median(self):
    #     OperationStep.objects.create(
    #         operation=self.op,
    #         step_id=2,
    #         name='Window Median',
    #         query_func='window',
    #         query_kwargs='{"window_fn":"Median","term":"usd_commitment","over":["year"]}',
    #         source_id=2
    #     )
    #
    #     queries = self.op.build_query(1, 0, True)
    #     _, dat = fetch_data(queries, database="default")
    #     self.assertTrue('median' in dat[0].keys())

    def test_can_perform_avg(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window Avg',
            query_func='window',
            query_kwargs='{"window_fn":"Avg","term":"usd_commitment","over":["year"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]["avg"] > 9)

    def test_can_perform_stddev(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window StdDev',
            query_func='window',
            query_kwargs='{"window_fn":"StdDev","term":"usd_commitment","over":["year"]}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]['stddev'] > 8)

    def test_can_generate_avg_aggregate(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["year"],"agg_func_name":"Avg", "operational_column":"usd_commitment"}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]["usd_commitment_Avg"] > 9)

    def test_can_perform_scalar_transform(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Transform',
            query_func='scalar_transform',
            query_kwargs='{"trans_func_name":"text_search", "operational_column":"short_description", "operational_value":"%wheat%"}',
            source_id=2
        )

        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue(dat[0]['short_description_text_search'])

    def test_can_perform_multi_transform(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Transform',
            query_func='multi_transform',
            query_kwargs='{"trans_func_name":"sum", "operational_columns":["usd_disbursement","usd_disbursement_deflated"]}',
            source_id=2
        )

        queries = self.op.build_query()
        _, dat = fetch_data(queries, database="default")
        self.assertTrue('usd_disbursement_sum' in dat[0].keys())

    def test_can_catch_sql_err(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Select",
            query_func="select",
            query_kwargs="{ \"columns\": [ \"iso10\" ] }",
            source_id=1
        )
        queries = self.op.build_query(1, 0, True)
        _, dat = fetch_data(queries, database="default")
        self.assertTrue("error" in list(dat[0].keys()))

    def test_can_catch_zip_err(self):
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Filter",
            query_func="filter",
            query_kwargs='{"filters":[{"field":"year", "value":9999, "func":"ge"}]}',
            source_id=1
        )
        queries = self.op.build_query(1, 0, False)
        _, dat = fetch_data(queries, database="default")
        self.assertEqual(len(dat), 0)


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
