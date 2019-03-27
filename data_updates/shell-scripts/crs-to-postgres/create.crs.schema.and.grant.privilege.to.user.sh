#!/usr/bin/env bash

database_name=$1
# Loop through all the database names in the file 'database.txt'

echo "Database name: "$database_name""
#sleep 2

#  Create the database
echo "Attempting to create database: "$database_name
echo "CREATE DATABASE "$database_name";"
echo "CREATE DATABASE "$database_name";" | psql -d postgres -e
#sleep 2

echo "Schema name  : crs"
#sleep 2
echo "=========="


#  Create the schema
echo "Creating schema: crs"
echo "CREATE SCHEMA crs;"
echo "CREATE SCHEMA IF NOT EXISTS crs;" | psql -d $database_name -e
#sleep 2

# Give all schema priviledges to the user 'postgres'
echo "Granting all priviledges on all tables to user 'postgres' in schema: "$database_name".crs"
echo "GRANT ALL ON ALL TABLES IN SCHEMA crs TO postgres;"
echo "GRANT ALL ON ALL TABLES IN SCHEMA crs TO postgres;" | psql -d $database_name -e
#sleep 2

# Give all schema priviledges to the user 'boss'
echo "Granting all priviledges on all tables to user 'boss' in schema: "$database_name".crs"
echo "GRANT ALL ON ALL TABLES IN SCHEMA crs TO boss;"
echo "GRANT ALL ON ALL TABLES IN SCHEMA crs TO boss;" | psql -d $database_name -e
#sleep 2
