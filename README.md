# DDW Analyst UI
The new and improved DDW Analyst UI interface

## Setup


### Docker deployment

1. Make sure you're starting with a clean DB volume, so Docker knows to create the new User `docker-compose down` `docker volume rm metadata`
2. Create a persistent dev volume `docker volume create --name=metadata`
3. Create a self-signed certificate `mkdir -p ssl && openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout ssl/privkey.pem -out ssl/fullchain.pem`
4. Build your app `docker-compose up --build -d`
5. Migrate the database. `docker-compose exec web python manage.py migrate`
6. Load test data `docker-compose exec web python manage.py loaddata test_data` `docker-compose exec web python manage.py loaddata --database=datasets test_datasets`
7. Alternatively, load the real data `export FTSUSER=X` `export FTSPASS=Y` `docker-compose exec web data_updates/completed_scripts.sh`
8. Create a superuser. `docker-compose exec web python manage.py createsuperuser`
9. Add the bit registry to npm config to install bit dependencies `npm config set @bit:registry https://node.bitsrc.io`
10. Install frontend dependencies `npm install`
11. Bundle frontend code and collect static files `npm run build`
12. Restart the app. `docker-compose restart`

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
7. Follow the steps under the virtualenv section below to intergrate with your local environment.

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
5. Load test data from a fixture like so `python manage.py loaddata test_data` `python manage.py loaddata --database=datasets test_datasets`
6. Create a superuser. `python manage.py createsuperuser`
7. Add the bit registry to npm config to install bit dependencies `npm config set @bit:registry https://node.bitsrc.io`
8. Install frontend dependencies `npm install`
9. Bundle frontend code and collect static files `npm run dev` NB: is set to watch for changes and recompile
10. Run the app. `export DJANGO_DEV='True' && python manage.py runserver`

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


### Letsencrypt certificates generation

1. If certbot has not been installed already, install certbot by following commands
  ```
  sudo add-apt-repository ppa:certbot/certbot
  sudo apt-get install certbot
  ```

2. Run below script to generate certificates
`certbot renew --dry-run  --webroot -w /root/ddw-analyst-ui/static/letsencrypt`

3. If the command above is run successfully copy certificates to the ssl folder of ddw app
  ```
  cp -f  /etc/letsencrypt/live/ddw.devinit.org/privkey.pem /root/ddw-analyst-ui/ssl/
  cp -f /etc/letsencrypt/live/ddw.devinit.org/fullchain.pem /root/ddw-analyst-ui/ssl/

  ```
  From ddw-analyst-ui root folder, reload nginx so that certificates are picked
  `docker-compose exec ddw-analyst-ui_nginx_1 nginx reload`

4. Check if there is a cron job set to renew certificates. If there is non add the cron task below. This will try to renew the certificate twice a day every day

`0 */12 * * * /root/ddw-analyst-ui/certbot.sh >/dev/null 2>&1`
