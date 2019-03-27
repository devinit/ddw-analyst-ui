#!/bin/bash


database_name=$1
schema_name=$2
table_name=$3

echo "Converting timestamp columns"

# Convert the data type of the specified columns where needed
while IFS='' read -r column_name || [[ -n "$column_name" ]]
do
    # Convert the column data type to 'timestamp'
    echo "Converting to timestamp: "$column_name""
    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE TIMESTAMP USING (TRIM("$column_name")::TIMESTAMP);"
    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE TIMESTAMP USING CAST(TRIM("$column_name") AS TIMESTAMP);" | psql -d $database_name -e
    #sleep 2

done < "$4"
