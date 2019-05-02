from django.db import connections


def fetch_data(queries, database="datasets"):
    """Fetch data from a database given a custom query."""
    count_query, main_query = queries
    with connections[database].chunked_cursor() as count_cursor:
        count_cursor.execute(count_query)
        count_results = count_cursor.fetchall()
    with connections[database].chunked_cursor() as main_cursor:
        main_cursor.execute(main_query)
        first_row = main_cursor.fetchone()
        columns = [col[0] for col in main_cursor.description]
        results = [
            dict(zip(columns, row)) for row in ([first_row] + main_cursor.fetchall())
        ]
        return (count_results[0][0], results)
