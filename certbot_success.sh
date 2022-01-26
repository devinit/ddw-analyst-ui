#!/bin/sh

cp -f /etc/letsencrypt/live/"${SITE_URL}"/privkey.pem /etc/letsencrypt/privkey.pem
cp -f /etc/letsencrypt/live/"${SITE_URL}"/fullchain.pem /etc/letsencrypt/fullchain.pem

cp -f /etc/letsencrypt/live/"${SPOTLIGHTS_URL}"/privkey.pem /etc/letsencrypt/spotlights_privkey.pem
cp -f /etc/letsencrypt/live/"${SPOTLIGHTS_URL}"/fullchain.pem /etc/letsencrypt/spotlights_fullchain.pem
