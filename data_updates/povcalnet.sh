#!/bin/bash

cd /root/ddw-analyst-ui
source env/bin/activate && python3 data_updates/Python/povcal_agg.py && python3 data_updates/Python/povcal_smy.py && python3 data_updates/Python/povcal_p20.py
