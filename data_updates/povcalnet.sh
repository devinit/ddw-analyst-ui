#!/bin/bash

cd /root/ddw-analyst-ui
source env/bin/activate && python3 data_updates/Python/povcal_watcher.py
