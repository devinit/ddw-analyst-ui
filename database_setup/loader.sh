
#/bin/bash

psql -d postgres <<HERE
\i dba.sql
\i user_schema_django.sql
\i database_schema.sql
\i table1_subset.sql
\i table2a_subset.sql
\i table2b_subset.sql
\i table5_subset.sql
HERE

