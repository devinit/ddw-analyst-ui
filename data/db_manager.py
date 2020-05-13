from django.db import connections
from django.db.utils import ProgrammingError


def fetch_data(queries, database="datasets"):
    """Fetch data from a database given a custom query."""
    count_query, main_query = queries
    with connections[database].chunked_cursor() as count_cursor:
        try:
            count_cursor.execute(count_query)
            count_results = count_cursor.fetchall()
        except ProgrammingError:
            count_results = [[1]]
    with connections[database].chunked_cursor() as main_cursor:
        try:
            main_cursor.execute(main_query)
            first_row = main_cursor.fetchone()
            columns = [col[0] for col in main_cursor.description]
            results = [
                dict(zip(columns, row)) for row in ([first_row] + main_cursor.fetchall())
            ]
        # Zip fails on empty dataset
        except TypeError:
            results = list()
        # Something wrong with the SQL
        except ProgrammingError as sql_err:
            results = [
                {
                    "error": str(sql_err)
                }
            ]
        return (count_results[0][0], results) if count_results else (0, results)
