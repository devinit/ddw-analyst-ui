#!/bin/bash
## gets run on host server

echo "Downloading tag: $1"

wget https://github.com/devinit/ddw-analyst-ui/archive/v$1.zip

echo "Download complete"

unzip v$1.zip

rm -rf v$1.zip

mkdir -p ~/ddw-analyst-ui

rsync -a ddw-analyst-ui-$1/ ~/ddw-analyst-ui/ || exit

rm -rf ddw-analyst-ui-$1

cd ~/ddw-analyst-ui || exit

echo SITE_URL"="${SITE_URL} >> .env
echo SPOTLIGHTS_URL"="${SPOTLIGHTS_URL} >> .env

cp certbot_success.sh ./ssl
chmod +x ssl/certbot_success.sh
mkdir -p certbot_logs

echo "Build JS"

npm i
npm run build

echo "Building docker"

docker-compose build db
docker-compose build web
docker-compose build nginx
docker-compose build rabbitmq
docker-compose build celery
docker-compose build spotlights

docker-compose down --remove-orphans
docker-compose up -d

docker-compose exec -T web python manage.py migrate

echo "Generating Javascript Assets"

npm i
npm run build
docker-compose exec -T web python manage.py collectstatic --no-input

echo "Fetch CSV Files"

docker-compose exec -T web python manage.py update_csv_files --validate
