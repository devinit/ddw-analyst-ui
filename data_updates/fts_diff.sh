#!/bin/bash

# comment out below line if running outside of docker container
cd /src

Rscript data_updates/R/fts_diff.R
