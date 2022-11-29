#!/bin/bash

cd /src

python3 data_updates/Python/iati_transactions.py
python3 manage.py update_meta iati_transactions
python3 manage.py update_meta iati_activities
python3 data_updates/Python/update_iati_publishers_table.py
python3 manage.py run_frozen_dataset_after_etl IATI
python3 -m data_updates.Python.iati_rhfp
