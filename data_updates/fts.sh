#!/bin/bash

Rscript data_updates/R/fts.R $FTSUSER $FTSPASS
python3 manage.py update_meta fts
