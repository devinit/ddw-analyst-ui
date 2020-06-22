from core import pypika_utils


class FTSQueryBuilder(pypika_utils.QueryBuilder):

    def __init__(self, initial_table_name, initial_schema_name):

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