# DDW Analyst UI
The new and improved DDW Analyst UI interface

## Setup


### Docker

1. Make sure you're starting with a clean DB volume, so Docker knows to create the new User `docker-compose down` `docker volume rm metadata`
2. Create a persistent dev volume `docker volume create --name=metadata`
3. Build your app `docker-compose up --build`
4. Migrate the database. `docker-compose run web python manage.py migrate`
5. Load test data `docker-compose run web python manage.py loaddata test_data` `docker-compose run web python manage.py loaddata test_datasets`
6. Create a superuser. `docker-compose run web python manage.py createsuperuser`
7. Install frontend dependencies `npm install`
8. Bundle frontend code and collect static files `npm run build` or `npm run docker:dev` for local development
9. Run the app. `docker-compose up`

### Development Database

To create a test development DB, for local development (e.g. virtualenv steps below)

1. Ensure the line that normally appears as `local   all             postgres                                peer` in `pg_hba.conf` instead reads `local   all             postgres                                trust`
2. Run script `./dev-db-setup.sh`
3. A database **analyst_ui** will be created in your local postgres instance.
4. Access sample database through default postgres user using

    `psql -d postgres`

    `\c analyst_ui`

5. For additional users, edit script **analyst_ui_users.sql** adding the username that you need
6. Run script to grant permissions to all the schemas and tables of analyst_ui
7. You can load test data from a fixture like so `python manage.py loaddata test_data` `python manage.py loaddata test_datasets`

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
5. Load test data from a fixture like so `python manage.py loaddata test_data`
6. Create a superuser. `python manage.py createsuperuser`
7. Install frontend dependencies `npm install`
8. Bundle frontend code and collect static files `npm run dev` NB: is set to watch for changes and recompile
9. Run the app. `python manage.py runserver`

### End-To-End Testing

This is set up to run with [Cypress](https://www.cypress.io/), and only locally at the moment.

1. Setup test users as specified in the `frontend/cypress/fixtures/users.json` file, with the password as the email
2. Run `npm run cy:run` for headless tests and `npm run cy:open` for interactive tests in a browser.

### Postman Setup for API Testing

If you're using Postman for testing the REST api, you can use the following setup:

1. Make sure you have an environment set for your collection.
2. `POST` to `http://localhost:8000/api/auth/login/` with `Basic Auth` and the Username and Password.
3. Paste this code in `Tests` which will save the token to the environment.
```
var jsonData = JSON.parse(responseBody);
postman.setEnvironmentVariable("token", jsonData.token);
```
4. In the Headers of your subsequent posts, send the Header `Authorization: Token {{token}}`
