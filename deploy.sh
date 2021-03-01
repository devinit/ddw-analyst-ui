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

echo "Building docker"

docker-compose build
docker-compose down --remove-orphans
docker-compose up -d

docker-compose exec -T web python manage.py migrate
