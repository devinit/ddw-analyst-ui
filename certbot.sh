#!/bin/bash
working_directory=/root/ddw-analyst-ui/
renewal_result="$(command certbot renew  --webroot -w /root/ddw-analyst-ui/static/letsencrypt)"
#Check if successful result is received
result="$(echo $renewal_result | grep -o Congratulations )"

#If successful copy certs to the correct folder and refresh nginx docker node
if [ $result ]; then
        cd $working_directory
        cp -f  /etc/letsencrypt/live/ddw.devinit.org/privkey.pem /root/ddw-analyst-ui/ssl/
        cp -f /etc/letsencrypt/live/ddw.devinit.org/fullchain.pem /root/ddw-analyst-ui/ssl/

        command docker-compose exec ddw-analyst-ui_nginx_1 nginx reload
fi
