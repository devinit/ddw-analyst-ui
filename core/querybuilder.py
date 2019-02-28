from core.db_utils import Utils

class QueryBuilder():

    def __init__(self):
        self.utils = Utils()
    
    def select_columns(self,table_name,*columns):
        #TODO Review some hard coded values, doing this for the sake of tests
        if(len(columns) == 1):
            if(columns[0] == -1):
                #Return all columns in the array
                return 'SELECT * FROM {tablename} limit {count}'.format(tablename=table_name,count=20)
        return 'SELECT {column} FROM {tablename} limit {count}'.format(column=','.join(columns),tablename=table_name,count=20)
        #c.execute(query)
        #return self.utils.dictfetchall(c)
       

    def addjoin(self,**column_names,**table_name,**join_types,**on_matchers,**condition):
        if(table_name.leng)
        

    def filter(self,original_query,**filters):
        

