#!/bin/bash

# comment out below line if running outside of docker container
cd /src

Rscript data_updates/R/iati_datastore.R  # "repo"."iati_datastore"
python3 manage.py update_meta iati_datastore
