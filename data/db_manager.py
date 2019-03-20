from django.db import connections
from django.db import transaction


@transaction.atomic
def fetch_data(queries, database="datasets"):
    """Fetch data from a database given a custom query."""
    count_query, main_query = queries
    with connections[database].cursor() as cursor:
        cursor.execute(count_query)
        count_results = cursor.fetchall()
        cursor.execute(main_query)
        columns = [col[0] for col in cursor.description]
        results = cursor.fetchall()
        return (count_results, columns, results)
