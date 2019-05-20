#!/bin/bash

/bin/bash data_updates/manual_data.sh
/bin/bash data_updates/oecd.sh
/bin/bash data_updates/povcalnet.sh
/bin/bash data_updates/wdi.sh
/bin/bash data_updates/weo.sh
/bin/bash data_updates/fts.sh

#Run db indexing after all data has been loaded
/bin/bash data_updates/indexing.sh
