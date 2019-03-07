from pypika import functions as pypika_fn
from pypika import Table, Tables, PostgreSQLQuery as Query
import json


class QueryBuilder:
    def __init__(self, operation):
        query_steps = operation.operationsteps_set
        initial_dataset = query_steps.first().source.sql_table
        self.current_dataset = Table(initial_dataset)
        self.current_query = Query.from_(self.current_dataset)
        for query_step in query_steps:
            query_func = getattr(self, query_step.query_func)
            query_kwargs_json = json.load(query_step.query_kwargs)
            self = query_func(**query_kwargs_json)

    def aggregate(self, group_by, agg_func_name, operational_column):
        self.current_query = Query.from_(self.current_dataset)
        self.current_query = self.current_query.groupby(*group_by)

        agg_func = getattr(pypika_fn, agg_func_name)  # https://pypika.readthedocs.io/en/latest/api/pypika.functions.html e.g. Sum, Count, Avg
        select_by = group_by
        current_operational_column = getattr(self.current_dataset, operational_column)

        operational_alias = "_".join([operational_column, agg_func_name])

        select_by.append(agg_func(current_operational_column, alias=operational_alias))

        self.select(select_by)
        self.current_dataset = self.current_query
        return self

    def filter(self, filters):
        #a =json.loads(filters)
        self.current_query  = Query.from_(self.current_dataset).select(self.current_dataset.star)\
        .where(self.current_dataset.name == name)

        for k,v in filters.items():
            self.current_query = self.current_query.where(getattr(self.current_dataset,k) == v)

        return self

    def transform(self):
        self.current_query = Query.from_(self.current_dataset)
        return self

    def join(self,table_name,join_on):
        table1 = self.current_dataset
        table2 = Table(table_name)
        q = self.current_query.join(table2).on_field(*join_on).select(
            table1.star,table2.star
        )

        self.current_query = q
        return self

    def select(self, columns=None):
        if columns:
            self.current_query = self.current_query.select(*columns)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star)
        return self

    def get_sql(self):
        return self.current_query.get_sql()
