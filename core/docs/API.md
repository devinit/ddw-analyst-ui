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
