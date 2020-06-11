#!/bin/bash

python3 data_updates/Python/manual_data_fts.py
python3 manage.py load_manual data_updates/manual/fts_dependencies
