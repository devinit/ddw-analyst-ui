# DDW Analyst UI
The new and improved DDW Analyst UI interface

## Setup
<!-- 1. Make your database `sudo su postgres -c 'psql -U postgres -d postgres -c '"'"'CREATE DATABASE ddw_metadata'"'"`
2. Make sure your psql database can accept connections outside of localhost e.g. /etc/postgresql/9.4/main/postgresql.conf: `listen_addresses = '*'`
3. Make sure your psql database accepts the Docker container e.g. /etc/postgresql/9.4/main/pg_hba.conf: `host ddw_metadata postgres 172.29.0.0/16 trust` -->
1. Create a persistent dev volume `docker volume create --name=metadata`
2. Build your app `docker-compose up --build`
3. Migrate the database. `docker-compose run web python manage.py migrate`
4. Create a superuser. `docker-compose run web python manage.py createsuperuser`
5. Collect static files. `docker-compose run web python manage.py collectstatic --no-input`
6. Run the app. `docker-compose up`
