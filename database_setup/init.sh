#/bin/bash

psql -d postgres --username=postgres <<HERE
\i dba.sql
HERE
