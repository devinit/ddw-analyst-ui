#!/usr/bin/env bash

# Use this script to create the tables in the 'table_2b_data' schema
# The database name is specified in the 'database.txt' file
# This script takes one argument from the command line
# The argument is the date (YYYY_MM_DD) of the OECD data release

#*****************************************************************************#

#$1 is the first argument passed to the script from the command line
#$2 is the second argument passed to the script from the command line
# Etc.

db_name="oecd_dac_table_2b_mirror"
release=$1
#echo "Release: ${release}"
character_encoding=$2
#echo "Character encoding: ${character_encoding}"
max_year=$3
#echo "Max year: ${max_year}"
copy_path=$4
#Path to which data is stored

# Check if the right number of arguments (= 3) was supplied
# $# is the number of argument passed to the script from the command line
# exit 1 = general bailout-upon-error
if [[ $# -ne 4 ]]; then
  echo "No or the wrong number of arguments supplied. Please supply one release date, e.g., 2016_04_20, one character ecoding, e.g., UTF8 and one max year, e.g., 2015."
  exit 1
# Check if the arguments supplied are in the right format (YYYY_MM_DD)
else
  if ! [[ $1 =~ ^[0-9]{4}_[0-9]{2}_[0-9]{2}$ ]]; then
    echo "The first argument supplied is of the wrong format. Please supply one release date as an argument, e.g., 2016_04_20."
    exit 1
  elif [ $2 != 'UTF8' ] && [ $2 != 'LATIN9' ]; then
    echo "The second argument supplied is of the wrong format. Please supply one character encoding as an argument, e.g., LATIN9 for releases prior to 2016 or UTF8 for releases in 2016 and after."
    exit 1
  elif ! [[ $3 =~ ^[0-9]{4}$ ]]; then
    echo "The third argument supplied is of the wrong format. Please supply one max year as an argument, e.g., 2014 for all 2015 releases, 2015 for all 2016 releases, etc."
    exit 1
  fi
fi

#*****************************************************************************#

# psql flags used

#-A
#--no-align
# Switches to unaligned output mode
# The default output mode is otherwise aligned

#-t
#--tuples-only
# Turns off printing of column names and result row count footers, etc.
# This is equivalent to the \t command

#-e
#--echo-queries
# Copies all SQL commands sent to the server to standard output (STDOUT) as well
# This is equivalent to setting the variable ECHO to queries

#-d dbname
#--dbname=dbname
# Specifies the name of the database to connect to
# This is equivalent to specifying dbname as the first non-option argument on the command line

#*****************************************************************************#
  echo "CREATE DATABASE "$db_name"" | psql -d postgres -e
  echo "CREATE SCHEMA IF NOT EXISTS "$db_name".table_2b_data" | psql -d postgres -e
  #echo "DB name: ${db_name}"

  # Drop the table if it exists

  echo -e "
    DROP TABLE IF EXISTS table_2b_data.\"${release}\" CASCADE;
  " | psql -A -t -e -d ${db_name};

  echo "#*****************************************************************************#";

  # Create the table

  echo -e "
    CREATE TABLE table_2b_data.\"${release}\"
    (
    row_id           SERIAL
    , recipient_code SMALLINT NOT NULL CONSTRAINT valid_recipient_code CHECK (recipient_code BETWEEN 30 AND 10203)
    , recipient_name CHARACTER VARYING NOT NULL
    , donor_code     SMALLINT NOT NULL CONSTRAINT valid_donor_code CHECK (donor_code BETWEEN 1 AND 20034)
    , donor_name     CHARACTER VARYING NOT NULL
    , part_code      INTEGER NOT NULL CONSTRAINT valid_part_code CHECK (part_code IN (1, 2))
    , part_name      CHARACTER VARYING NOT NULL CONSTRAINT valid_part_name CHECK (part_name IN ('1 : Part I - Developing Countries', '2 : Part II - Countries in Transition'))
    , aid_type_code  SMALLINT NOT NULL CONSTRAINT valid_aid_type_code CHECK (aid_type_code BETWEEN 201 AND 972)
    , aid_type_name  CHARACTER VARYING NOT NULL
    , data_type      CHARACTER(1) NOT NULL CONSTRAINT valid_data_type CHECK (data_type IN ('A', 'D'))
    , amount_type    CHARACTER VARYING NOT NULL
    , time           SMALLINT NOT NULL CONSTRAINT valid_time CHECK (time BETWEEN 1960 AND ${max_year})
    , year           SMALLINT NOT NULL CONSTRAINT valid_year CHECK (year BETWEEN 1960 AND ${max_year})
    , value          NUMERIC
    , flags          TEXT
    , CONSTRAINT table_2b_data_${release}_pkey PRIMARY KEY (row_id)
    );
  " | psql -A -t -e -d ${db_name};

  echo "#*****************************************************************************#";

  # Populate the table

  echo -e "
    COPY table_2b_data.\"${release}\"
    (
    recipient_code
    , recipient_name
    , donor_code
    , donor_name
    , part_code
    , part_name
    , aid_type_code
    , aid_type_name
    , data_type
    , amount_type
    , time
    , year
    , value
    , flags
    )
    FROM '"$copy_path"'
    WITH (FORMAT 'csv', DELIMITER ',', ENCODING '${character_encoding}', HEADER 'True')
    ;
  " | psql -A -t -e -d ${db_name};

  echo "#*****************************************************************************#";
