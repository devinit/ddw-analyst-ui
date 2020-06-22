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


def update_fts_from_list(queries, database="datasets"):

    # We shall need to remove the delete bit if we decide to only add the "differences" instead of the whole lost as currenty implemented
    with connections[database].cursor() as delete_cursor:
        try:
            delete_cursor.execute(queries[0])
        except ProgrammingError as sql_e:
            count_results = [[1]]
            results = [
                {
                    "result": "error" ,
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
                    "message": str(sql_error) + " " + queries[1],
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
