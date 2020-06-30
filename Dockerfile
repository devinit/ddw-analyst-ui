# start with a base image
FROM python:3.7
LABEL maintainer="akmiller01 <Alex Miller, alex.miller@devinit.org>"

RUN mkdir /src
ADD ./ /src

WORKDIR /src
# install dependencies
RUN apt-get update
RUN apt-get install -y net-tools
# Uncomment the line below on dev environments to log cron
# RUN apt-get install -y rsyslog
RUN apt-get install -y cron
RUN pip install -r requirements.txt

# R dependencies
RUN apt-get install -y r-base-core
RUN apt-get install -y r-cran-reshape2

ENV DJANGO_SETTINGS_MODULE=ddw_analyst_ui.docker_settings

# Below lines are cron specific
RUN python3 manage.py crontab remove
RUN python3 manage.py crontab add
# Below line 'exports' env to cron, otherwise cron will not run
RUN printenv >> /etc/environment

CMD export DOCKER_HOST_IP=$(route -n | awk '/UG[ \t]/{print $2}') && service cron restart && gunicorn -w 2 -b 0.0.0.0:80 -t 600 --keep-alive 600 ddw_analyst_ui.wsgi
