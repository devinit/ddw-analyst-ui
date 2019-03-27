#!/usr/bin/env bash

# Loop through all the database names in the file 'database.txt'
#typically db -- crs_mirror_db, schema -- crs, table -- date
database_name=$1
schema_name=$2
table_name=$3
table_template_path=$4


echo "Database name: "$database_name""
#sleep 2
# Loop through all the schema names in the file 'schema.txt'

echo "Schema name  : "$schema_name""
#sleep 2
# Loop through all the table names in the file 'table.txt'

echo "Table name   : "$table_name""
#sleep 2
echo "=========="

# If the table exists already delete it
echo "Deleting table: "$database_name"."$schema_name"."$c""
echo "DROP TABLE IF EXISTS "$database_name"."$schema_name".\""$table_name"\";"
echo "DROP TABLE IF EXISTS "$database_name"."$schema_name".\""$table_name"\";" | psql -d $database_name -e
#sleep 2

echo "Deleting sequence crs_mirror_sequence"
echo "DROP SEQUENCE "$schema_name".crs_mirror_sequence;" | psql -d $database_name -e
echo "Create new sequence"
echo "create sequence "$schema_name".crs_mirror_sequence increment by 1 start 1;" | psql -d $database_name -e

table_template=$(<$table_template_path)


# Create the table
echo "Creating table: "$database_name"."$schema_name".\""$table_name"\""
#echo -e "CREATE TABLE "$database_name"."$schema_name".\""$table_name"\" (\n""$table_template"
echo -e "CREATE TABLE "$database_name"."$schema_name".\""$table_name"\" (\n""$table_template" | psql -d $database_name -e
#sleep 2

