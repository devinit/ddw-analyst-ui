#!/bin/bash

cd /src

python3 data_updates/Python/iati_transactions.py
python3 manage.py update_meta iati_transactions
