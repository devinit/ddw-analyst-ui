from django.db import connections


def fetch_data(query, database="datasets"):
    """Fetch data from a database given a custom query."""
    with connections[database].cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        results = cursor.fetchall()
        return (columns, results)
