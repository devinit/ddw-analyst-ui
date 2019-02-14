# ddw-analyst-ui
The new and improved DDW Analyst UI interface

# Setup
1. Make your database `sudo su postgres -c 'psql -U postgres -d postgres -c '"'"'CREATE DATABASE ddw_metadata'"'"`
2. Build your app `docker-compose build`
3. Migrate the database. `docker-compose run web python manage.py migrate`
