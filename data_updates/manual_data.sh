#!/bin/bash

cd /root/ddw-analyst-ui
source env/bin/activate
python3 data_updates/Python/manual_data.py
python3 manage.py load_manual
