#!/bin/bash

# comment out below line if running outside of docker container
cd /src

python3 -m data_updates.Python.oecd_data
