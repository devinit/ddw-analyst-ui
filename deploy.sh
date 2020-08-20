#!/bin/bash
## gets run on host server
mkdir -p ~/ddw-analyst-ui
cd ~/ddw-analyst-ui || exit

echo "Downloading tag: $1"

wget https://github.com/devinit/ddw-analyst-ui/archive/v$1.zip

echo "Download complete"

unzip v$1.zip

rm -rf v$1.zip

cd ddw-analyst-ui-$1 || exit

docker-compose build
docker-compose down --remove-orphans
docker-compose up -d

npm i

npm run build

docker-compose exec web python manage.py migrate

docker-compose restart
