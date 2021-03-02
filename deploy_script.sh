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

docker-compose build db
docker-compose build web
docker-compose build nginx
docker-compose build rabbitmq
docker-compose build celery
docker-compose build spotlights

docker-compose down --remove-orphans
docker-compose up -d

docker-compose exec -T web python manage.py migrate
