#!/usr/bin/env bash

database_name=$1
schema_name=$2
table_name=$3

# Loop through all the database names in the file 'database.txt'
echo "Converting int columns"
# Convert the data type of the specified columns where needed
while IFS='' read -r column_name || [[ -n "$column_name" ]]
do

    # Convert the column data type to 'int'
    echo "Converting column data type to int: "$column_name""
    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE integer CAST(trim(${column_name}) AS integer);"
    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE integer USING CAST(trim(${column_name}) AS integer);" | psql -d $database_name -e
    #sleep 2

done < "$4"
