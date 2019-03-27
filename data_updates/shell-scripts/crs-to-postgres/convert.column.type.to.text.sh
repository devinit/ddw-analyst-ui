#!/usr/bin/env bash


database_name=$1
schema_name=$2
table_name=$3

echo "Converting text columns"

# Convert the data type of the specified columns where needed
while IFS='' read -r column_name || [[ -n "$column_name" ]]
do
    # Convert the column data type to 'text'
    echo "Converting column data type to text: "$column_name""

    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE text USING (TRIM("$column_name")::TEXT);"
    echo "ALTER TABLE "$schema_name".\""$table_name"\" ALTER COLUMN "$column_name" TYPE text USING (TRIM("$column_name")::TEXT);" | psql -d $database_name -e
    #sleep 2

done < "$4"
