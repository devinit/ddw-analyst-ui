from core import pypika_utils
import re


class TableQueryBuilder(pypika_utils.QueryBuilder):

    def __init__(self, initial_table_name, initial_schema_name, operation=None):

        if operation is not None:
            super().__init__(operation=operation)
        else:
            self.limit_regex = re.compile('LIMIT \d+', re.IGNORECASE)
            self.initial_table_name = initial_table_name
            self.initial_schema_name = initial_schema_name

            self.current_dataset = pypika_utils.Table(
                self.initial_table_name,
                schema=self.initial_schema_name
            )

            self.current_query = pypika_utils.Query.from_(self.current_dataset)

    def delete(self, condition=None):

        return pypika_utils.Query.from_(self.current_dataset).delete().get_sql()

    def insert(self, data, columns=None):

        return pypika_utils.Query.into(self.current_dataset).insert(*data).get_sql()

    def create_table_from_query(self, table_name: str, schema_name: str) -> str:

        # CREATE TABLE table_name AS query
        select = self.current_query
        table = pypika_utils.Table(table_name, schema_name)
        create_table = pypika_utils.Query.create_table(
            table).as_select(select).get_sql()
        return create_table

    def delete_table(self, table_name: str, schema_name: str) -> str:
        table = pypika_utils.Table(table_name, schema_name)
        sql = "DROP TABLE IF EXISTS {table}".format(table=table.get_sql())
        return sql
