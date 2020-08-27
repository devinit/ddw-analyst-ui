#!/bin/bash

# comment out below line if running outside of docker container
cd /src

/bin/bash data_updates/fts_precode.sh
/bin/bash data_updates/fts_diff.sh
