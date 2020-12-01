### API

##### This documents publicly available api endpoints, please explore `core.views` and `core.urls` to find more

1.  Login and get token <br>
    POST - https://ddw.devinit.org/api/auth/login/<br>
    Request Body:<br>
    {
      'username': [USER_NAME]
      'password': [USER_PASSWORD]
    }<br>
    Response:
    {
      "expiry": "2020-05-21T19:44:52.855584Z",
      "token": "444e8557ae50b6513490ca73c970af8d87e089ade581ed30a4ae654c16928d7a",
      "user": {
        "id": 1,
        "username": ....,
        "tag_set": [],
        "operation_set": [],
        "review_set": [],
        "is_superuser": true,
        "user_permissions": []
      }
    }<br>
    PS:<br>
        - Login is not required anymore for read only endpoints;<br>
        - To access write endpoints include authorization header<br>
          (Authorization: Token 557ae50b6513490ca73c970af8d87e089ade581ed30a4ae654c16928d7a)

2.  Fetch scheduled events<br>
    GET - https://ddw.devinit.org/api/scheduled_event/<br>
    Headers:<br>
    Content-Type: application/json

3.  Fetch scheduled event run instances (history) - takes in the scheduled event ID<br>
    GET - https://ddw.devinit.org/api/scheduled_event/[EVENT_ID]/run_instances/<br>
    Headers:<br>
    Content-Type: application/json

4.  List all update scripts<br>
    GET - https://ddw.devinit.org/api/list_update_scripts/

5.  Download csv file for selected operation id;<br>
    GET - https://ddw.devinit.org/api/export/[OPERATION_ID]/

6.  Return result of query operation id;<br>
    GET - https://ddw.devinit.org/api/dataset/data/[OPERATION_ID]/

7. Return list of published datasets;<br>
    GET - https://ddw.devinit.org/api/datasets/

8. Return list of both draft and published datasets;<br>
    GET - https://ddw.devinit.org/api/datasets/mine/

9. Return details of selected dataset;<br>
    GET - https://ddw.devinit.org/api/dataset/[DATASET_ID]/

10. Return list of sources;<br>
    GET - https://ddw.devinit.org/api/sources/

11. Return details of source selected by id;<br>
    GET - https://ddw.devinit.org/api/sources/[SOURCE_ID]/

12. Return list of Frozen Data<br>
    GET - https://ddw.devinit.org/api/frozendata/ returns listing of frozen data<br>

13. Create new frozen data<br>
    POST - https://ddw.devinit.org/api/frozendata/<br>

    Request Body:<br>

        {
          "parent_db_table":"[TABLE_NAME]",
          "completed":"p", // options include p (pending), r (running), c (completed), e (errored)
          "active":true,
          "comment": ""
        }



14. Details of Frozen Data selected by ID<br>
    GET - https://ddw.devinit.org/api/frozendata/[FROZENDATA_ID]/ returns details of frozen data<br>

15. Delete frozen data
    DELETE - https://ddw.devinit.org/api/frozendata/[FROZENDATA_ID]/<br>

16. Return list of Saved Query Data<br>
    GET - https://ddw.devinit.org/api/savedquerysets/ returns listing of Saved Query Data<br>

17. Create new saved query data
    POST - https://ddw.devinit.org/api/savedquerysets/<br>

    Request Body:<br>

        {
          "operation":"[OPERATION_ID]",
          "completed":"p", // options include p (pending), r (running), c (completed), e (errored)
          "active":true,
          "comment": ""
        }

18. Details of Saved Query Data selected by ID<br>
    GET - https://ddw.devinit.org/api/savedqueryset/[SAVEDQUERYDATA_ID]/ returns details of saved query data<br>

19. Delete saved query data
    DELETE - https://ddw.devinit.org/api/savedqueryset/[SAVEDQUERYDATA_ID]/<br>

20. Download Frozen Data<br>
    GET - https://ddw.devinit.org/api/tables/download/[FROZEN_TABLE_NAME]/archives/<br>

21. Download Saved Query Set Data<br>
    GET - https://ddw.devinit.org/api/tables/download/[QUERY_SET_DB_TABLE]/dataset/<br>

22. Get Current User's Sub-queries<br>
    GET - https://ddw.devinit.org/api/datasets/subqueries/mine/<br>

23. Get all sub-queries<br>
    GET - https://ddw.devinit.org/api/datasets/subqueries/<br>


24. Changes to Queries:<br>
    Added a flag to differentiate sub-queries from other queries<br>
    Payload to create a query will therefore change to:<br>
  {
    "name":"testing Subquery to Pass None Draft",
    "description":"Subquery testing",
    "is_sub_query": true,
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"country_name\"]}",
                "name":"Select",
                "description":"Select all CRS ISO Codes",
                "source":30
            },
            {
                "step_id":2,
                "query_func":"filter",
                "query_kwargs":"{\"filters\":[{\"field\":\"country_code\",\"func\":\"eq\",\"value\":\"918\"}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":30
            }
        ]
}

Creating a sub-query for use in a SELECT clause column <br>

{
    "name":"testing Subquery to Pass None Draft",
    "description":"Subquery testing",
    "is_sub_query": true,
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"country_code\"]}",
                "name":"Select",
                "description":"Select all CRS ISO Codes",
                "source":30
            },
            {
                "step_id":2,
                "query_func":"select_sub_query",
                "query_kwargs":"{\"filters\":[{\"left_source\":1,\"left_field\":\"recipient_code\",\"func\":\"eq\",\"right_source\":30,\"right_field\":\"country_code\"}]}",
                "name":"Compare Source with End",
                "description":"Filtering now",
                "source":30
            }
        ]
}

To create a SELECT query with a sub-qeury as part of it's columns e.g <br>

{
    "name":"Sub-query Select",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"donor_code\",\"recipient_code\",\"recipient_name\", 11]}",
                "name":"Select",
                "description":"Select all CRS ISO Codes",
                "source":1
            },
            {
                "step_id":2,
                "query_func":"filter",
                "query_kwargs":"{\"filters\":[{\"field\":\"region_code\",\"func\":\"eq\",\"value\":\"10010\"}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":1
            }
        ]
}


Note the last column (in the select step) is an integer, which represents the id of the sub-query. The qub-query can be in any position as the user so wishes <br>

Using a sub-query that uses the EXISTS operator <br>

{
    "name":"Sub-query Select",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"donor_code\",\"recipient_code\",\"recipient_name\"]}",
                "name":"Select",
                "description":"Select all CRS ISO Codes",
                "source":1
            },
            {
                "step_id":2,
                "query_func":"exists",
                "query_kwargs":"{\"filters\":[{\"left_source\":30,\"left_field\":\"country_code\",\"func\":\"eq\",\"right_source\":1,\"right_field\":\"recipient_code\"}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":1
            }
        ]
}

Note that for NOT EXISTS, we use the notexits as the query_func in step 2, and everything else is the same.<br>


Using a sub-query in IN operator <br>

{
    "name":"testing Subquery IN",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"recipient_name\"]}",
                "name":"Select",
                "description":"Select using sub-query and IN operator",
                "source":1
            },
            {
                "step_id":2,
                "query_func":"operator_or_where_clause_sub_query",
                "query_kwargs":"{\"filters\":[{\"field\":\"donor_code\",\"func\":\"IN\",\"value\":17}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":1
            }
        ]
}

Note that the value in the filters holds the ID of the sub-query to be used by the IN operator. The sub-query must also be returning one column strictly<br>

For NOT IN, we use the NOTIN in step two as the func.<br>


Using a sub-query in UNION operator <br>

{
    "name":"testing Subquery to Pass None Draft",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"country_code\"]}",
                "name":"Select",
                "description":"Select using sub-query and UNION operator",
                "source":30
            },
            {
                "step_id":2,
                "query_func":"operator_or_where_clause_sub_query",
                "query_kwargs":"{\"filters\":[{\"field\":\"flow_name\",\"func\":\"UNION\",\"value\":21}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":30
            }
        ]
}

{
    "name":"Testing UNION with two sub-query IDs",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"operator_or_where_clause_sub_query",
                "query_kwargs":"{\"filters\":[{\"field\":22,\"func\":\"UNION\",\"value\":21}]}",
                "name":"Filter them",
                "description":"Filtering now",
                "source":30
            }
        ]
}

Note that the columns in the sub-query and main query here must be same number and similar in data types.<br>
<br>
We have left the "source" variable in all steps made up of new query_funcs for backwards compatibility<br>

Using a sub-query in a WHERE clause to compare with column in current dataset<br>
{
    "name":"Sub-query for where compare with column",
    "description":"Subquery testing",
    "is_draft": false,
    "operation_steps":
        [
            {
                "step_id":1,
                "query_func":"select",
                "query_kwargs":"{\"columns\":[\"donor_code\"]}",
                "name":"Select",
                "description":"Select all CRS ISO Codes",
                "source":1
            },
            {
                "step_id":2,
                "query_func":"operator_or_where_clause_sub_query",
                "query_kwargs":"{\"filters\":[{\"field\":\"donor_code\",\"func\":\"eq\",\"value\":\"27\"}]}",
                "name":"Compare Source with End",
                "description":"Filtering now",
                "source":1
            }
        ]
}

Here value is numeric and represents the sub-query we shall compare the column against
