#!/bin/bash
working_directory=/root/ddw-analyst-ui
command certbot renew  --webroot -w "$working_directory"/static/letsencrypt --deploy-hook "$working_directory"/certbot_success.sh
