#!/bin/bash

# comment out below line if running outside of docker container
cd /src

python3 manage.py update_csv_files
