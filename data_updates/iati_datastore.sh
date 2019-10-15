#!/bin/bash

Rscript data_updates/R/iati_datastore.R  # "repo"."iati_datastore"
python3 manage.py update_meta iati_datastore
