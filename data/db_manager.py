from django.db import connections
from django.conf import settings
import csv
import os


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


def stream_to_file(queries, database="datasets"):
    """Stream large amounts of data to a file."""
    _, main_query = queries
    count = 1
    with connections[database].chunked_cursor() as main_cursor:
        cur_name = main_cursor.name + ".csv"
        csv_name = os.path.join(settings.STATIC_ROOT, cur_name)
        main_cursor.execute(main_query)
        first_row = main_cursor.fetchone()
        header = [col[0] for col in main_cursor.description]
        with open(csv_name, 'wb') as csv_file:
            writer = csv.writer(csv_file, delimiter=",")
            writer.writerow(header)
            writer.writerow(first_row)
            next_row = main_cursor.fetchone()
            while next_row is not None:
                count += 1
                writer.writerow(next_row)
                next_row = main_cursor.fetchone()
        return (count, cur_name)
