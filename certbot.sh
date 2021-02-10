#!/bin/bash
working_directory=/root/ddw-analyst-ui
# Removed --webroot options, as the options that were used to create the original certificate are sufficient
# Also helps to run the renew for all (sub)domains in one go
command certbot renew --deploy-hook "$working_directory"/certbot_success.sh
