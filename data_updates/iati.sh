#!/bin/bash

cd /src

/bin/bash data_updates/iati_registry_refresh.sh
/bin/bash data_updates/iati_transactions.sh
