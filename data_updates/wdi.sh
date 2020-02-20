#!/bin/bash

Rscript data_updates/R/wdi.R  # "repo"."wdi"
python3 manage.py update_meta wdi
