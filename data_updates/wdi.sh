#!/bin/bash

# comment out below line if running outside of docker container
cd /src

Rscript data_updates/R/wdi.R  # "repo"."wdi"
python3 manage.py update_meta wdi
