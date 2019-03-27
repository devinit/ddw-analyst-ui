#!/usr/bin/env bash

database_name=$1
schema_name=$2
table_name=$3
copy_template_path=$4
file=$5
# Loop through all the database names in the file 'database.txt'

echo "Database name: "$database_name""
#sleep 2

# Loop through all the schema names in the file 'schema.txt'
#    while read -r schema_name
#    do

echo "Schema name  : "$schema_name""

echo "Table name   : "$table_name""
#sleep 2
echo "=========="

# Tell me what you are doing
echo "Populating table: "$database_name"."$schema_name".\""$table_name"\""

copy_template=$(<$copy_template_path)
# Populate the table
#echo -e "COPY "$database_name"."$schema_name"."$table_name" (\n""$copy_template""\nFROM "$file"\nWITH (DELIMITER '|', ENCODING 'UTF8');"
echo -e "COPY "$schema_name".\""$table_name"\" (\n""$copy_template""\nFROM '"$file"'\n DELIMITER ',' ENCODING 'LATIN1' CSV HEADER;" | psql -d $database_name -e
#sleep 2