from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Tag, AuditLogEntry, Operation, OperationStep
from rest_framework.test import APIClient
from core.pypika_utils import QueryBuilder

TEST_USER = "test_user"
TEST_PASS = "test_password"


class TestFixtureLoad(TestCase):
    fixtures = ['test_data']

    def test_tag_exists_after_load(self):
        t = Tag.objects.get(pk=1)
        self.assertEquals(t.name, 'oda')

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
        self.user_tag = Tag.objects.create(name="user_tag", user=self.user)
        self.not_user_tag = Tag.objects.create(name="not_user_tag")

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
                "operationstep_set": [{"name": "Select", "step_id": 1}]
            },
            format="json"
        )
        assert response.status_code == 201


class TestPypikaUtils(TestCase):
    """Test case class for testing query generation by pypika"""
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

    def test_can_generate_select(self):
        expected = 'SELECT * FROM "repo"."crs_current"'
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_filter(self):
        expected = 'SELECT * FROM "repo"."crs_current" WHERE "year"=1973'
        OperationStep.objects.create(
            operation=self.op,
            step_id=2,
            name="Filter",
            query_func="filter",
            query_kwargs='{"filters":{"year":1973}}',
            source_id=1
        )
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(), expected)

    def test_can_generate_join(self):
        expected = 'SELECT "crs_current".*,"dac1_current".* FROM "repo"."crs_current" JOIN "repo"."dac1_current" ON '\
        '"crs_current"."donor_code"="dac1_current"."donor_code"'
        OperationStep.objects.create(
            operation = self.op,
            step_id = 2,
            name = 'Join',
            query_func = 'join',
            query_kwargs ='{"table_name":"dac1_current","schema_name":"repo", "join_on":["donor_code"]}',
            source_id = 2
        )
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(),expected)
    
    def test_can_generate_join_for_specific_columns(self):
        expected = 'SELECT "crs_current".*,"dac1_current"."part_code","dac1_current"."part_name" FROM "repo"."crs_current" JOIN "repo"."dac1_current" ON '\
        '"crs_current"."donor_code"="dac1_current"."donor_code"'

        OperationStep.objects.create(
            operation = self.op,
            step_id = 2,
            name = 'Join',
            query_func = 'join',
            query_kwargs ='{"table_name":"dac1_current","schema_name":"repo", "join_on":["donor_code"],\
            "columns":{"table1":["donor_name","usd_commitment"],"table2":["part_code","part_name"]}}',
            source_id = 2
        )

        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(),expected)


    def test_can_sum(self):
        
        expected = 'SELECT "donor_code",SUM("usd_commitment") "usd_commitment_Sum" FROM "repo"."crs_current" GROUP BY "donor_code"'

        OperationStep.objects.create(
            operation = self.op,
            step_id = 2,
            name = 'Aggregate',
            query_func = 'aggregate',
            query_kwargs ='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id = 2
        )
        
        qb = QueryBuilder(self.op)
        self.assertEqual(qb.get_sql_without_limit(),expected)

    def test_can_sum_from_joined_column_fails(self):
        expected = 'SELECT "donor_code",SUM("usd_commitment") "usd_commitment_Sum" FROM "repo"."crs_current" GROUP BY "donor_code"'

        OperationStep.objects.create(
            operation = self.op,
            step_id = 2,
            name = 'Join',
            query_func = 'join',
            query_kwargs ='{"table_name":"dac1_current","schema_name":"repo", "join_on":["donor_code"]}',
            source_id = 2
        )

        OperationStep.objects.create(
            operation = self.op,
            step_id = 3,
            name = 'Aggregate',
            query_func = 'aggregate',
            query_kwargs ='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id = 2
        )

        
        qb = QueryBuilder(self.op)
        self.assertNotEqual(qb.get_sql_without_limit(),expected)
    
    def test_can_sum_from_joined_column_passes(self):
        expected = 'SELECT "donor_code",SUM("usd_commitment") "usd_commitment_Sum" FROM "repo"."crs_current" GROUP BY "donor_code"'

        OperationStep.objects.create(
            operation = self.op,
            step_id = 2,
            name = 'Join',
            query_func = 'join',
            query_kwargs ='{"table_name":"dac1_current","schema_name":"repo", "join_on":["donor_code"]\
            ,"columns":{"table1":["donor_name","usd_commitment"],"table2":["part_code","part_name"]}}',
            source_id = 2
        )

        OperationStep.objects.create(
            operation = self.op,
            step_id = 3,
            name = 'Aggregate',
            query_func = 'aggregate',
            query_kwargs ='{"group_by":["donor_code"],"agg_func_name":"Sum", "operational_column":"usd_commitment"}',
            source_id = 2
        )

        
        qb = QueryBuilder(self.op)
        #self.assertEqual(qb.get_sql_without_limit(),expected)
        pass

    def test_can_generate_perform_ntil(self):
        pass
    
    def test_can_generate_perform_dense_rank(self):
        pass

    def test_can_perform_first_value(self):
        pass
    
    def test_can_perform_last_value(self):
        pass

    def test_can_perform_median(self):
        pass

    def test_can_perform_avg(self):
        pass
    
    def test_can_perform_stddve(self):
        pass
    
    def test_can_generate_avg_aggregate(self):
        pass
    
    def test_can_generate_select_with_limit(self):
        pass

