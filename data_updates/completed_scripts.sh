#!/bin/bash

# comment out below line if running outside of docker container
cd /src

/bin/bash data_updates/manual_data.sh  # Must always be run first to set up Source objects
/bin/bash data_updates/oecd.sh
/bin/bash data_updates/povcalnet.sh
/bin/bash data_updates/wdi.sh
/bin/bash data_updates/weo.sh
/bin/bash data_updates/fts.sh
/bin/bash data_updates/iati_datastore.sh

#Run db indexing after all data has been loaded
/bin/bash data_updates/indexing.sh
