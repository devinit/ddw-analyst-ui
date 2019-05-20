#!/bin/bash

python3 data_updates/Python/manual_data.py
python3 manage.py load_manual
