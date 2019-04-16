# start with a base image
FROM python:3
LABEL maintainer="akmiller01 <Alex Miller, alex.miller@devinit.org>"

RUN mkdir /src
ADD ./ /src

WORKDIR /src
# install dependencies
RUN apt-get update
RUN apt-get install -y net-tools
RUN pip install -r requirements.txt

# R dependencies
RUN apt-get install -y r-base-core
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y "ppa:marutter/rrutter"
RUN add-apt-repository -y "ppa:marutter/c2d4u"
RUN apt-get update
RUN apt-get install -y r-cran-reshape2

ENV DJANGO_SETTINGS_MODULE=ddw_analyst_ui.docker_settings

CMD export DOCKER_HOST_IP=$(route -n | awk '/UG[ \t]/{print $2}') && gunicorn -w 2 -b 0.0.0.0:80 ddw_analyst_ui.wsgi
