#!/bin/bash
## gets run on host server

echo "Downloading tag: $1"

wget https://github.com/devinit/ddw-analyst-ui/archive/v$1.zip

echo "Download complete"

unzip v$1.zip

rm -rf v$1.zip

mkdir -p ~/ddw-analyst-ui

cp -R -f ddw-analyst-ui-$1/ ~/ddw-analyst-ui/ || exit

rm -rf ddw-analyst-ui-$1

cd ~/ddw-analyst-ui || exit

docker-compose build
docker-compose down --remove-orphans
docker-compose up -d

npm ci

npm run build

docker-compose exec web python manage.py migrate

docker-compose restart

git checkout master
git fetch
git stash
git pull origin master
docker-compose build --no-cache web
npm install
npm run build
docker-compose down
docker-compose up -d
docker-compose exec web python manage.py migrate
cd ~
