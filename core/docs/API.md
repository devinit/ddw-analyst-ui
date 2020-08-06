### API

##### This documents publicly available api endpoints, please explore `core.views` and `core.urls` to find more

1.  Login and get token
    POST - https://ddw.devinit.org/api/auth/login/
    Request Body:
    {
      'username': [USER_NAME]
      'password': [USER_PASSWORD]
    }
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
    }
    PS:
        - Login is not required anymore for read only endpoints;
        - To access write endpoints include authorization header
          (Authorization: Token 557ae50b6513490ca73c970af8d87e089ade581ed30a4ae654c16928d7a)

2.  Fetch scheduled events
    GET - https://ddw.devinit.org/api/scheduled_event/
    Headers:
    Content-Type: application/json

3.  Fetch scheduled event run instances (history) - takes in the scheduled event ID
    GET - https://ddw.devinit.org/api/scheduled_event/[EVENT_ID]/run_instances/
    Headers:
    Content-Type: application/json

4.  List all update scripts
    GET - https://ddw.devinit.org/api/list_update_scripts/

5.  Download csv file for selected operation id;
    GET - https://ddw.devinit.org/api/export/[OPERATION_ID]/

6.  Return result of query operation id;
    GET - https://ddw.devinit.org/api/dataset/data/[OPERATION_ID]/

7. Return list of published datasets;
    GET - https://ddw.devinit.org/api/datasets/

8. Return list of both draft and published datasets;
    GET - https://ddw.devinit.org/api/datasets/mine/

9. Return details of selected dataset;
    GET - https://ddw.devinit.org/api/dataset/[DATASET_ID]/

10. Return list of sources;
    GET - https://ddw.devinit.org/api/sources/

11. Return details of source selected by id;
    GET - https://ddw.devinit.org/api/sources/[SOURCE_ID]/
