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

echo "Building JS"

npm ci

npm run build

docker-compose exec web python manage.py migrate

echo "Setting up rabbitmq user and permissions"

function setup_rabbitmq {
  until docker-compose exec -T rabbitmq rabbitmqctl start_app; do
      log "Rabbit is unavailable - sleeping"
      sleep 10
  done

  docker-compose exec -T rabbitmq rabbitmqctl add_user admin ddw_analyst_ui
  docker-compose exec -T rabbitmq rabbitmqctl add_vhost myvhost
  docker-compose exec -T rabbitmq rabbitmqctl set_permissions -p myvhost admin ".*" ".*" ".*"
}

setup_rabbitmq

docker-compose restart
