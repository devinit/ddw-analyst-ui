from django.db import connections
from django.db.utils import ProgrammingError
import re


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


def count_rows(query, database="datasets"):
    with connections[database].chunked_cursor() as count_cursor:
        try:
            count_cursor.execute(query)
            count_results = count_cursor.fetchall()
        except ProgrammingError:
            count_results = [[1]]

    return count_results[0][0] if count_results else 0


def update_table_from_tuple(queries, database="datasets"):

    # We shall need to remove the delete bit if we decide to only add the "differences" instead of the whole lost as currenty implemented
    with connections[database].cursor() as delete_cursor:
        try:
            delete_cursor.execute(queries[0])
        except ProgrammingError as sql_e:
            results = [
                {
                    "result": "error",
                    "message": str(sql_e),
                }
            ]
            return results
    with connections[database].cursor() as update_cursor:
        try:
            update_cursor.execute(queries[1])
            connections[database].commit()
            results = [
                {
                    "result": "success",
                    "message": "Successfully updated",
                }
            ]
        except ProgrammingError as sql_error:
            results = [
                {
                    "result": "error",
                    "message": str(sql_error),
                }
            ]
        except Exception as e:
            results = [
                {
                    "result": "error",
                    "message": str(e),
                }
            ]
        return results


def run_query(query, database="datasets"):
    with connections[database].cursor() as create_cursor:
        try:
            create_cursor.execute(query)
            connections[database].commit()
            results = [
                {
                    "result": "success",
                    "message": "Successfully created",
                }
            ]
        except ProgrammingError as sql_error:
            results = [
                {
                    "result": "error",
                    "message": str(sql_error),
                }
            ]
        except Exception as e:
            results = [
                {
                    "result": "error",
                    "message": str(e),
                }
            ]
        return results


def analyse_query(query, database="datasets"):
    with connections[database].cursor() as analyse_cursor:
        try:
            analyse_query = "EXPLAIN ANALYZE {}".format(query)
            analyse_cursor.execute(analyse_query)
            raw_results = list(analyse_cursor.fetchall())
            time_in_ms = 0.0
            ms_in_one_second = 1000000.0
            # We get last two i.e planning time and execution time
            for raw_result in raw_results[-2]:
                time_event, = re.findall('Time: ([\d\.]+) ms', raw_result)
                time_in_ms += float(time_event)
            # time_in_seconds = float(time_in_ms/ms_in_one_second)
            results = [
                {
                    "result": "success",
                    "message": time_in_ms
                }
            ]
        except ProgrammingError as sql_error:
            results = [
                {
                    "result": "error",
                    "message": str(sql_error),
                }
            ]
        except Exception as e:
            results = [
                {
                    "result": "error",
                    "message": str(e),
                }
            ]
        return results
