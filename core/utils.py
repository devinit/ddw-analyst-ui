
class Utils():
    
    def dictfetchall(cursor):
        "Return all rows from a cursor as a dict"
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    def buildtablenames(**table_names):
        """Return a formal sql table name alias"""
        final_name = ''
        for key in table_names:
            value = table_names[key]
            final_name.join([])
