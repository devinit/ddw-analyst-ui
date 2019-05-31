from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from knox.models import AuthToken

from core.models import AuditLogEntry, Operation, OperationStep, Tag
from core.pypika_utils import QueryBuilder

TEST_USER = "test_user"
TEST_PASS = "test_password"
TEST_SUPERUSER = "test_superuser"
TEST_SUPERPASS = "test_superpass"


class TestFixtureLoad(TestCase):
    fixtures = ['test_data']

    def test_tag_exists_after_load(self):
        t = Tag.objects.get(pk=1)
        self.assertEqual(t.name, 'oda')


class TestAuditLog(TestCase):
    """Test case class for testing functionality of audit log"""
    def setUp(self):
        self.user = User.objects.create_user(TEST_USER, 'test@test.test', TEST_PASS)

    def test_increment_audit_log(self):
        initial_audit_count = AuditLogEntry.objects.count()
        Tag.objects.create(name="test_tag", user=self.user)
        final_audit_count = AuditLogEntry.objects.count()
        self.assertEqual(initial_audit_count + 1, final_audit_count)


class TestRestFramework(TestCase):
    """Test case class for testing functionality of REST framework"""
    fixtures = ['test_data']

    def setUp(self):
        self.user = User.objects.create_user(TEST_USER, 'test@test.test', TEST_PASS)
        self.superuser = User.objects.create_superuser(TEST_SUPERUSER, 'test@test.test', TEST_SUPERPASS)
        self.user_tag = Tag.objects.create(name="user_tag", user=self.user)
        self.not_user_tag = Tag.objects.create(name="not_user_tag")

        settings_manager = override_settings(SECURE_SSL_REDIRECT=False)
        settings_manager.enable()
        self.addCleanup(settings_manager.disable)

    def test_get_tags_unauthenticated(self):
        client = APIClient()
        response = client.get('/api/tags/')
        assert response.status_code == 401

    def test_get_tags_authenticated(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/api/tags/')
        assert response.status_code == 200

    def test_non_owner_cannot_delete_tag(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.delete('/api/tags/{}/'.format(self.not_user_tag.pk))
        assert response.status_code == 403

    def test_owner_can_delete_tag(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.delete('/api/tags/{}/'.format(self.user_tag.pk))
        assert response.status_code == 204

    def test_post_nested_operation(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post(
            '/api/operations/',
            {
                "name": "Name",
                "operation_query": "Query",
                "theme": 1,
                "operation_steps": [
                    {
                        "name": "Select",
                        "step_id": 1,
                        "source": 1,
                        "query_func": "filter",
                        "query_kwargs": "{\"filters\":[{\"field\":\"year\",\"func\":\"lt\",\"value\":\"1987\"}]}"
                    }
                ]
            },
            format="json"
        )
        assert response.status_code == 201

    def test_post_password_change(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post(
            '/api/change_password/',
            {
                "old_password": TEST_PASS,
                "new_password1": "a_completely_new_pw",
                "new_password2": "a_completely_new_pw",
            },
            format="json"
        )
        assert response.status_code == 202

    def test_post_password_change_fail(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post(
            '/api/change_password/',
            {
                "old_password": TEST_PASS,
                "new_password1": "a_completely_new_pw",
                "new_password2": "a_completely_new_pw2",
            },
            format="json"
        )
        assert response.status_code == 400

    def test_list_update_scripts(self):
        client = APIClient()
        client.force_authenticate(user=self.superuser)
        response = client.get('/api/list_update_scripts/')
        assert response.status_code == 200

    def test_execute_update(self):
        client = APIClient()
        token = AuthToken.objects.create(self.superuser)
        client.force_authenticate(user=self.superuser, token=token)
        response = client.post(
            '/api/execute_update/',
            {
                "token": str(token),
                "script_name": "test_stream.sh"
            }
        )
        assert response.status_code == 200


class TestPypikaUtils(TestCase):
    """Test case class for testing query generation by pypika"""
    maxDiff = None
    fixtures = ['test_data']

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
        expected = 'SELECT * FROM "public"."crs_current"'
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_select_by_column(self):
        expected = 'SELECT "sq0"."year" FROM (SELECT * FROM "public"."crs_current") "sq0"'
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Select",
            query_func="select",
            query_kwargs="{ \"columns\": [ \"year\" ] }",
            source_id=1
        )
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_filter(self):
        expected = 'SELECT "sq0".* FROM (SELECT * FROM "public"."crs_current") "sq0" WHERE "sq0"."year">=1973 OR "sq0"."short_description" ILIKE \'%sector%\' OR "sq0"."short_description" ILIKE \'%wheat%\''
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Filter",
            query_func="filter",
            query_kwargs='{"filters":[{"field":"year", "value":1973, "func":"ge"},{"field":"short_description", "value":"%sector%|%wheat%", "func":"text_search"}]}',
            source_id=1
        )
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_join(self):
        expected = 'SELECT "sq0".*,"dac1_current".* FROM (SELECT * FROM "public"."crs_current") "sq0" FULL OUTER JOIN "public"."dac1_current" ON "sq0"."donor_code"="dac1_current"."donor_code"'
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"donor_code":"donor_code"}}',
            source_id=2
        )
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_join_for_specific_columns(self):
        expected = 'SELECT "sq0".*,"dac1_current"."part_code","dac1_current"."part_name" FROM (SELECT * FROM "public"."crs_current") "sq0" FULL OUTER JOIN "public"."dac1_current" ON "sq0"."donor_code"="dac1_current"."donor_code" AND "sq0"."year"="dac1_current"."year"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"donor_code":"donor_code","year":"year"},\
            "columns_x":["donor_name","usd_commitment"],"columns_y":["part_code","part_name"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_sum(self):
        expected = 'SELECT "sq0"."donor_code",SUM("sq0"."usd_commitment") "usd_commitment_Sum" FROM (SELECT * FROM "public"."crs_current") "sq0" GROUP BY "sq0"."donor_code"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_sum_from_joined_column_fails(self):
        expected = 'SELECT "donor_code",SUM("usd_commitment") "usd_commitment_Sum" FROM "public"."crs_current" GROUP BY "donor_code"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Join',
            query_func='join',
            query_kwargs='{"table_name":"dac1_current","schema_name":"public", "join_on":{"donor_code":"donor_code"}}',
            source_id=2
        )

        OperationStep.objects.create(
            operation=self.op,
            step_id=3,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertNotEqual(qb.get_sql_without_limit(), expected)

    def test_can_sum_from_joined_column_passes(self):
        expected = 'SELECT "sq1"."part_name",SUM("sq1"."usd_commitment") "usd_commitment_Sum" FROM (SELECT "sq0".*,"dac1_current"."part_code","dac1_current"."part_name" FROM (SELECT * FROM "public"."crs_current") "sq0" FULL OUTER JOIN "public"."dac1_current" ON "sq0"."year"="dac1_current"."year") "sq1" GROUP BY "sq1"."part_name"'

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

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_perform_ntile(self):
        expected = 'SELECT "sq0".*,NTILE(4) OVER(ORDER BY "sq0"."usd_commitment") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window Ntile',
            query_func='window',
            query_kwargs='{"window_fn":"NTile","term":4,"order_by":["usd_commitment"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_perform_dense_rank(self):
        expected = 'SELECT "sq0".*,DENSE_RANK() OVER(ORDER BY "sq0"."usd_commitment") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window denserank',
            query_func='window',
            query_kwargs='{"window_fn":"DenseRank","order_by":["usd_commitment"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_first_value(self):
        expected = 'SELECT "sq0".*,FIRST_VALUE("sq0"."usd_commitment") OVER(ORDER BY "sq0"."year") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window first val',
            query_func='window',
            query_kwargs='{"window_fn":"FirstValue","term":"usd_commitment","order_by":["year"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_last_value(self):
        expected = 'SELECT "sq0".*,LAST_VALUE("sq0"."usd_commitment") OVER(ORDER BY "sq0"."year") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window last val',
            query_func='window',
            query_kwargs='{"window_fn":"LastValue","term":"usd_commitment","order_by":["year"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_median(self):
        expected = 'SELECT "sq0".*,MEDIAN("sq0"."usd_commitment") OVER(PARTITION BY "sq0"."year") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window Median',
            query_func='window',
            query_kwargs='{"window_fn":"Median","term":"usd_commitment","over":["year"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_avg(self):
        expected = 'SELECT "sq0".*,AVG("sq0"."usd_commitment") OVER(PARTITION BY "sq0"."year") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window Avg',
            query_func='window',
            query_kwargs='{"window_fn":"Avg","term":"usd_commitment","over":["year"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_stddev(self):
        expected = 'SELECT "sq0".*,STDDEV("sq0"."usd_commitment") OVER(PARTITION BY "sq0"."year") FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Window StdDev',
            query_func='window',
            query_kwargs='{"window_fn":"StdDev","term":"usd_commitment","over":["year"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_avg_aggregate(self):
        expected = 'SELECT "sq0"."year",AVG("sq0"."usd_commitment") "usd_commitment_Avg" FROM (SELECT * FROM "public"."crs_current") "sq0" GROUP BY "sq0"."year"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Aggregate',
            query_func='aggregate',
            query_kwargs='{"group_by":["year"],"agg_func_name":"Avg", "operational_column":"usd_commitment"}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_select_with_default_limit(self):
        expected = 'SELECT * FROM "public"."crs_current" LIMIT 10'
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql(), expected)

    def test_can_generate_select_with_defined_limit(self):
        expected = 'SELECT * FROM "public"."crs_current" LIMIT 5 OFFSET 10'
        self.assertEqual(self.op.build_query(limit=5, offset=10)[1], expected)

    def test_can_generate_select_without_limit(self):
        expected = 'SELECT * FROM "public"."crs_current"'
        self.assertEqual(self.op.build_query(offset=10)[1], expected)

    def test_can_perform_scalar_transform(self):
        expected = 'SELECT "sq0".*,"sq0"."short_description" ILIKE \'%wheat%\' "short_description_text_search" FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Transform',
            query_func='scalar_transform',
            query_kwargs='{"trans_func_name":"text_search", "operational_column":"short_description", "operational_value":"%wheat%"}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_perform_multi_transform(self):
        expected = 'SELECT "sq0".*,0+"sq0"."usd_commitment"+"sq0"."usd_disbursement" "usd_commitment_sum" FROM (SELECT * FROM "public"."crs_current") "sq0"'

        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name='Transform',
            query_func='multi_transform',
            query_kwargs='{"trans_func_name":"sum", "operational_columns":["usd_commitment","usd_disbursement"]}',
            source_id=2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)
