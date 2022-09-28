#!/bin/bash

# comment out below line if running outside of docker container
cd /src

echo "Initializing download process"

# Fetching enviroment variables to use in operation
# We have two options here, either to use python scripts as below or to Us load_mirrors.R which does the same job
# Because its a python enviroment sticking with python scripts
echo "================ Fetcing CRS ====================="
python3 data_updates/Python/download_oecd.py -t CRS

echo "================ Fetcing DAC Table1 ====================="
python3 data_updates/Python/download_oecd.py -t TABLE1

echo "================ Fetcing DAC Table2a ====================="
python3 data_updates/Python/download_oecd.py -t TABLE2A

echo "================ Fetcing DAC Table2b ====================="
python3 data_updates/Python/download_oecd.py -t TABLE2B

echo "================ Fetcing DAC Table5 ====================="
python3 data_updates/Python/download_oecd.py -t TABLE5


echo "Using R scripts to cleanup downloaded data and load to postgres DB"

Rscript data_updates/R/load_mirrors.R

python3 manage.py update_meta crs_current
python3 manage.py update_meta dac1_current
python3 manage.py update_meta dac2a_current
python3 manage.py update_meta dac2b_current
python3 manage.py update_meta dac5_current

echo "=============== Successfully processed OECD mirrors==============="
