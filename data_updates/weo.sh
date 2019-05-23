#!/bin/bash

Rscript data_updates/R/weo.R  # "repo"."weo"
python3 manage.py update_meta weo
