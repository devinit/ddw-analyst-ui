#!/bin/bash

# comment out below line if running outside of docker container
cd /src

Rscript data_updates/R/db_indexing.R
