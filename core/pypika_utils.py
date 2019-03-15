from pypika import analytics as an, functions as pypika_fn
from pypika import Table, PostgreSQLQuery as Query
import core.const as const
import re
import types
import json


class QueryBuilder:

    def __init__(self, operation=None):

        self.limit_regex = re.compile('LIMIT \d+', re.IGNORECASE)

        query_steps = operation.operationstep_set

        self.current_dataset = Table(query_steps.first().source.active_mirror_name, schema=query_steps.first().source.schema)
        self.current_query = Query.from_(self.current_dataset)

        for query_step in query_steps.all():
            query_func = getattr(self, query_step.query_func)
            kwargs = query_step.query_kwargs
            if isinstance(kwargs, type(None)):
                self = query_func()
            else:
                query_kwargs_json = json.loads(kwargs)
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

    def window(self, window_fn, columns=None, over=None, order_by=None, **kwargs):

        self.current_query = Query.from_(self.current_dataset)
        tmp_query= ''
        window_ = getattr(an, window_fn)

        # Check if additional **kwargs are required in for given window function
        if window_fn == 'DenseRank' or window_fn == 'Rank' or window_fn == 'RowNumber':
            tmp_query = window_().over(*over)

            if order_by:
                for order in order_by:
                    tmp_query = tmp_query.orderby(getattr(self.current_dataset, order))
        else:
            tmp_query = window_(**kwargs).over(*over)
            if order_by:
                for order in order_by:
                    tmp_query = tmp_query.orderby(getattr(self.current_dataset, order))

        if columns:
            self.current_query = self.current_query.select(*columns, tmp_query)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star, tmp_query)

        self.current_dataset = self.current_query
        return self


    def filter(self, filters):
        self.current_query = Query.from_(self.current_dataset)
        self.select([self.current_dataset.star])

        for k, v in filters.items():
            self.current_query = self.current_query.where(getattr(self.current_dataset, k) == v)

        self.current_dataset = self.current_query
        return self

    def transform(self):
        self.current_query = Query.from_(self.current_dataset)
        return self

    def join(self, table_name,schema_name, join_on,criterion=None,columns=None):
       
        table1 = self.current_dataset
        table2 = Table(table_name,schema=schema_name)
        table1_columns = [table1.star]
        table2_columns = [table2.star]
        
        if columns:
            print(columns)
            table1_columns = map(lambda x: getattr(table1,x) ,columns.get('table1'))
            table2_columns = map(lambda x: getattr(table2,x) , columns.get('table2'))
            
        q = self.current_query.join(table2).on_field(*join_on).select(
            *table1_columns, *table2_columns
        )

        #if criterion:     

        self.current_query = q
        self.current_dataset = self.current_query
        return self

    def select(self, columns=None,groupby=None):
        if columns:
            self.current_query = self.current_query.select(*columns)
        else:
            self.current_query = self.current_query.select(self.current_dataset.star)
        return self

    def count_sql(self):
        self.current_query = Query.from_(self.current_dataset)
        return self.current_query.select(pypika_fn.Count(self.current_dataset.star)).get_sql()
 
    def get_sql(self, limit=const.default_limit_count, offset=0):
        if limit == 0:
            limit = "0"  # Pypika refused to allow limit 0 unless it's a string...
        final_query = self.current_query.get_sql()
        if self.limit_regex.match(final_query):
            return final_query
        else:
            return self.current_query.limit(limit).offset(offset).get_sql()

    def get_sql_without_limit(self):
        return self.current_query.get_sql()
