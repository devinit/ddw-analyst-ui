# start with a base image
FROM python:3
MAINTAINER akmiller01 <Alex Miller, alex.miller@devinit.org>

RUN mkdir /src
ADD ./ /src

WORKDIR /src
# install dependencies
RUN apt-get update
RUN apt-get install -y net-tools
RUN pip install -r requirements.txt

CMD export DOCKER_HOST_IP=$(route -n | awk '/UG[ \t]/{print $2}') && gunicorn -w 2 -b 0.0.0.0:80 ddw_analyst_ui.wsgi
