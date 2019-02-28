
#/bin/bash


#Only run this script after you have initialzed migration for other apps django apps

psql -d analyst_ui --username=postgres <<HERE
\i database_schema.sql
\i table1_subset.sql
\i table2a_subset.sql
\i table2b_subset.sql
\i table5_subset.sql
HERE
