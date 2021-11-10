#!/bin/bash
working_directory=/root/ddw-analyst-ui
#If successful copy certs to the correct folder and refresh nginx docker node
cd $working_directory

cp -f /etc/letsencrypt/live/"${SITE_URL}"/privkey.pem /etc/letsencrypt/privkey.pem
cp -f /etc/letsencrypt/live/"${SITE_URL}"/fullchain.pem /etc/letsencrypt/fullchain.pem

cp -f /etc/letsencrypt/live/"${SPOTLIGHTS_URL}"/privkey.pem /etc/letsencrypt/spotlights_privkey.pem
cp -f /etc/letsencrypt/live/"${SPOTLIGHTS_URL}"/fullchain.pem /etc/letsencrypt/spotlights_fullchain.pem
