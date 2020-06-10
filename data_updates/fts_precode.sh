#!/bin/bash

Rscript data_updates/R/fts_precode.R
python3 manage.py update_meta fts_precode
