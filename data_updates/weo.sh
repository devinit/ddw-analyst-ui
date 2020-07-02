#!/bin/bash

# comment out below line if running outside of docker container
cd /src

Rscript data_updates/R/weo.R  # "repo"."weo"
python3 manage.py update_meta weo
