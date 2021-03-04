# DDW Analyst UI
The new and improved DDW Analyst UI interface

## Setup


### Docker Deployment

1. Make sure you're starting with a clean DB volume, so Docker knows to create the new User `docker-compose down` `docker volume rm metadata2`
2. Create a persistent dev volume `docker volume create --name=metadata2`
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

### Import CSV Files

1. Manually run management command to download csv files:

        docker-compose exec web python manage.py update_csv_files

2. Create a scheduled event to periodically download updates from the git repo. The bash script is `update_csv_files.sh`

3. The git hub repo with csv files can be found [here](https://github.com/devinit/ddw-data-update-configs)


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
7. Add the bit registry to npm config to install bit dependencies ``npm config set @bit:registry https://node.bitsrc.io
8. Install frontend dependencies `npm install`
9. Bundle frontend code and collect static files `npm run dev` NB: is set to watch for changes and recompile
10. Run the app. `export DJANGO_DEV='True' && python manage.py runserver`

### Docker Development

1. Make sure you're starting with a clean DB volume, so Docker knows to create the new User:

        docker-compose down

        docker volume rm metadata2
2. Create a persistent dev volume:

        docker volume create --name=metadata2

3. Create a self-signed certificate:

        mkdir -p ssl && openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout ssl/privkey.pem -out ssl/fullchain.pem

4. Build & run your app with the dev docker config:

        docker-compose -f docker-compose.dev.yml up --build

5. Migrate the database:

        docker-compose exec web python manage.py migrate

6. Load test data:

        docker-compose exec web python manage.py loaddata test_data

        docker-compose exec web python manage.py loaddata --database=datasets test_datasets

7. Alternatively, you can acquire a db dump of the live data (binary) and import it into your database:

        docker-compose exec db psql -U analyst_ui_user -d analyst_ui -c 'drop schema public CASCADE;'
        docker-compose exec db psql -U analyst_ui_user -d analyst_ui -c 'create schema public;'
        docker cp [DB BUMP FILE NAME].backup ddw-analyst-ui_db_1:/var/lib/postgresql/data
        docker exec ddw-analyst-ui_db_1 pg_restore -U analyst_ui_user -d analyst_ui /var/lib/postgresql/data/[DB BUMP FILE NAME].backup
        docker-compose exec web python3 manage.py migrate

8. Create a superuser:

        docker-compose exec web python manage.py createsuperuser

9.  Add the bit registry to npm config to install bit dependencies:

        npm config set @bit:registry https://node.bitsrc.io

10. Install frontend dependencies:

        npm install

11. Start frontend dev environment which watches and collects static files:

        npm run dev

### Scheduled Events

Configure a cronjob to run the `run-schedules.sh` script which in turn runs the command that checks for scheduled events every minute

    * * * * * /root/run-schedules.sh >/root/cron-logs.txt 2>&1

### Freeze/Unfreeze and Save Queryset features
Make sure the following schemas are created;

- `archives` i.e `CREATE SCHEMA archives;`
- `dataset` i.e `CREATE SCHEMA dataset;`

### FTS Precode feature set up and use
On first run (i.e if you have used a database dump without FTS Precoded tables included or a clean DB set up) run the following scripts;
1. `docker-compose exec web data_updates/manual_data.sh`
2. `docker-compose exec web data_updates/manual_data_fts.sh` which adds the FTS metadata into the DB

The above should only be run once, on initial deployment of the feature, and only if using a clean and fresh DB set up with no data or using a DB dump that does not include the FTS metadata

To pull the latest FTS updates from the APIs, we shall run
3. `docker-compose exec web data_updates/fts.sh`. Note that at this point the analyst may download the updated codelists and edit them, then re-upload them using the https://ddw.devinit.org/update/ feature

To precode and join the dependency tables, we shall run:
4. `docker-compose exec web data_updates/fts_precode.sh`. This should be run everytime there is a change made to the codelist entries or everytime the script in 3 above is run.

To update the manual FTS tables with missing codelist items, we shall finally run the below script
5. `docker-compose exec web data_updates/fts_diff.sh`

We can run 4 and 5 above in one step by using:
`docker-compose exec web data_updates/finalise_precode.sh`
This will be the preferred way of running them from the front end as a scheduled event.

NOTE:
1. All the above scripts should be run in that exact order on first run / deployment.
2. After any update (i.e after running the script in 3 above, or an analyst using the https://ddw.devinit.org/update/ feature) is made to the codelists, run `docker-compose exec web data_updates/finalise_precode.sh` which combines 4 and 5 into one step. This can be run from the `Scheduled Events` on the front end.


### End-To-End Testing

This is set up to run with [Cypress](https://www.cypress.io/).

To test locally:

1. Update the `baseUrl` option in the `cypress.json` file to one that suits your current need
2. Setup test users as specified in the `frontend/cypress/fixtures/users.json` file
3. Run `npm run cy:run` for headless tests and `npm run cy:open` for interactive tests in a browser.

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


### API Documentation

Read more [here](./core/docs/API.md)


### Management Commands


### Deployment

1. Create a release branch with a name format `release/v[VERSION NUMBER]`
2. Create a GitHub release with a name format `v[VERSION NUMBER]`
3. On the server, there should be a `deploy.sh` script in the HOME folder. If not, make one with the contents of the `deploy.sh` file in this repo
4. Run the script to deploy a specific version e.g `bash deploy.sh 2.0.2`
