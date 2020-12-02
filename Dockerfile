# start with a base image
FROM python:3.7
LABEL maintainer="akmiller01 <Alex Miller, alex.miller@devinit.org>"

RUN mkdir /src
ADD ./ /src

WORKDIR /src
# install dependencies
RUN apt-get update
RUN apt-get install -y net-tools
# Downgrade pip to be able to install all our dependencies
# Remove below line when a version of django-celery that supports celery 4.4.7 is released
RUN pip install pip==20.2.4
RUN pip install -r requirements.txt

# R dependencies
RUN apt-get install -y r-base-core
RUN apt-get install -y r-cran-reshape2

ENV DJANGO_SETTINGS_MODULE=ddw_analyst_ui.docker_settings

CMD export DOCKER_HOST_IP=$(route -n | awk '/UG[ \t]/{print $2}') && gunicorn -w 2 -b 0.0.0.0:80 -t 6000 --keep-alive 6000 ddw_analyst_ui.wsgi
