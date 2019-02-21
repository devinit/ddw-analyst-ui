## Development Database Setup

To create a test development DB,

1. Change to the directory ddw-analyst-ui-db
2. Create auth schema by running ./init.sh
3. Before operation, create postgre managed user database in schema user_mgnt  by running migration script

python manage.py migrate  --database auth_migration_db

4. Run script ./loader.sh
5. A database **analyst_ui** will be created in your local postgre instance.
6. Access sample database through default postgre user using

psql -d postgres
\c analyst_ui

7. For additional users, edit script **analyst_ui_users.sql** adding the username that you need
8. Run script to grant permissions to all the schemas and tables of analyst_ui