#!/bin/bash
## gets run on host server

APP_NAME="ddw-analyst-ui"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR=$SCRIPT_DIR'/'$APP_NAME
REPOSITORY="git@github.com:devinit/"$APP_NAME".git"


echo "clone current branch if not exists"

if [ -d $APP_DIR ]; then
      cd $APP_DIR

  {
      # Move back to root directory
      echo "Cloning new content from develop"
      git fetch
      git stash
      git checkout develop
      git reset --hard origin/develop
      } || {
      echo "Failed to update from git repository"
      exit 20;
  }
else
  {
      git clone -b develop $REPOSITORY

      } || {
      echo "Failed to perform git clone on $REPOSITORY with branch develop"
      exit 20;
  }
fi

cd ~/ddw-analyst-ui || exit

echo "Building docker"

docker-compose build
docker-compose down --remove-orphans
docker-compose up -d

echo "Building JS"

npm ci

npm run build

docker-compose exec -T web python manage.py migrate

echo "Setting up rabbitmq user and permissions"

function setup_rabbitmq {
  until docker-compose exec -T rabbitmq rabbitmqctl start_app; do
      echo "Rabbit is unavailable - sleeping"
      sleep 10
  done

  docker-compose exec -T rabbitmq rabbitmqctl add_user admin ddw_analyst_ui
  docker-compose exec -T rabbitmq rabbitmqctl add_vhost myvhost
  docker-compose exec -T rabbitmq rabbitmqctl set_permissions -p myvhost admin ".*" ".*" ".*"
}

setup_rabbitmq

docker-compose restart
