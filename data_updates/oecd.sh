#!/bin/bash

echo -e "Initializing download process"

# Fetching enviroment variables to use in operation
# We have two options here, either to use python scripts as below or to Us load_mirrors.R which does the same job
# Because its a python enviroment sticking with python scripts
echo -e "================ Fetcing CRS =====================\n"
exec python3 ./Python/download_oecd_crs.py

echo -e "================ Fetcing DAC Table1 =====================\n"
exec python3 ./Python/download_oecd_dac_table_1.py

echo -e "================ Fetcing DAC Table2a =====================\n"
exec python3 ./Python/download_oecd_dac_table_2a.py

echo -e "================ Fetcing DAC Table2b =====================\n"
exec python3 ./Python/download_oecd_dac_table_2b.py

echo -e "================ Fetcing DAC Table5 =====================\n"
exec python3 ./Python/download_oecd_dac_table_5.py


echo -e "\n\n Using R scripts to cleanup downloaded data"


db_username=$PG_DDL_USER
db_port=$PG_DDL_PORT
db_default_db=$PG_DDL_DB

echo -e "Starting setup with : \nUsername: $db_username \nDB Port : $db_port \nDefault DB : $db_default_db";