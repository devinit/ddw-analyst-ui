# DDW Analyst UI
The new and improved DDW Analyst UI interface

## Setup

<!-- 1. Make your database `sudo su postgres -c 'psql -U postgres -d postgres -c '"'"'CREATE DATABASE ddw_metadata'"'"`
2. Make sure your psql database can accept connections outside of localhost e.g. /etc/postgresql/9.4/main/postgresql.conf: `listen_addresses = '*'`
3. Make sure your psql database accepts the Docker container e.g. /etc/postgresql/9.4/main/pg_hba.conf: `host ddw_metadata postgres 172.29.0.0/16 trust` -->

### Docker

1. Create a persistent dev volume `docker volume create --name=metadata`
2. Build your app `docker-compose up --build`
3. Migrate the database. `docker-compose run web python manage.py migrate`
4. Create a superuser. `docker-compose run web python manage.py createsuperuser`
5. Install frontend dependencies `npm install`
6. Bundle frontend code and collect static files `npm run build` or `npm run docker.dev` for local development
7. Run the app. `docker-compose up`

### virtualenv - development

**Prerequisites**

  - python
  - virtualenv
  - NodeJS
  - postgreSQL

1. Initialise a virtual environment `virtualenv env`
2. Activate & enter virtualenv environment `source env/bin/activate`
3. Install python dependencies `pip install -r requirements.txt`
4. Migrate the database. `python manage.py migrate`
5. Create a superuser. `python manage.py createsuperuser`
6. Install frontend dependencies `npm install`
7. Bundle frontend code and collect static files `npm run dev` NB: is set to watch for changes and recompile
8. Run the app. `python manage.py runserver`

### Development Database

To create a test development DB,

2. Run script `./dev-db-setup.sh`
3. A database **analyst_ui** will be created in your local postgre instance.
4. Access sample database through default postgre user using

    `psql -d postgres`

    `\c analyst_ui`

5. For additional users, edit script **analyst_ui_users.sql** adding the username that you need
6. Run script to grant permissions to all the schemas and tables of analyst_ui
