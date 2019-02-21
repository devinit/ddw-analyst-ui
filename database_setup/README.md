## Development Database Setup

To create a test development DB,

1. Change to the directory ddw-analyst-ui-db
2. Run script ./loader.sh
3. A database **analyst_ui** will be created in your local postgre instance.
4. Access sample database through default postgre user using

psql -d postgres
\c analyst_ui

5. For additional users, edit script **analyst_ui_users.sql** adding the username that you need
6. Run script to grant permissions to all the schemas and tables of analyst_ui