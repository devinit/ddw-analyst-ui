#!/bin/bash
working_directory=/root/ddw-analyst-ui
#If successful copy certs to the correct folder and refresh nginx docker node
cd $working_directory
cp -f  /etc/letsencrypt/live/ddw.devinit.org/privkey.pem /root/ddw-analyst-ui/ssl/
cp -f /etc/letsencrypt/live/ddw.devinit.org/fullchain.pem /root/ddw-analyst-ui/ssl/

cp -f  /etc/letsencrypt/live/api.devinit.org/privkey.pem /root/ddw-analyst-ui/ssl/spotlights_privkey.pem
cp -f /etc/letsencrypt/live/api.devinit.org/fullchain.pem /root/ddw-analyst-ui/ssl/spotlights_fullchain.pem

command docker-compose exec ddw-analyst-ui_nginx_1 nginx reload
