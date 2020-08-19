#!/bin/bash

cd /root/ddw-analyst-ui/

/usr/local/bin/docker-compose exec -T web python3 manage.py run_schedules
