import os
import progressbar
import pandas as pd
from sqlalchemy import create_engine
from lxml import etree
from lxml.etree import XMLParser
from iati_transaction_spec import IatiFlat, A_DTYPES, A_NUMERIC_DTYPES, T_DTYPES, T_NUMERIC_DTYPES
import boto3
from datetime import datetime


current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


s3_key = os.environ.get('S3_KEY', None)
s3_secret = os.environ.get('S3_SECRET', None)
s3_host = "https://ams3.digitaloceanspaces.com"
s3_region = "ams3"

if s3_key and s3_secret and s3_host and s3_region:
    s3_session = boto3.session.Session()
    s3_client = s3_session.client(
        's3',
        region_name=s3_region,
        endpoint_url=s3_host,
        aws_access_key_id=s3_key,
        aws_secret_access_key=s3_secret
    )
else:
    raise(Exception('S3_KEY or S3_SECRET not found. Please configure environmental variables before continuing.'))


DATA_SCHEMA = "repo"
DATA_TABLENAME = "iati_transactions"
ACTIVITY_DATA_TABLENAME = "iati_activities"
IATI_BUCKET_NAME = "di-s3"
IATI_FOLDER_NAME = "iati_registry/"


def main():
    large_parser = XMLParser(huge_tree=True)
    iatiflat = IatiFlat()
    activity_header = iatiflat.activity_header
    transaction_header = iatiflat.transaction_header

    # engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    engine = create_engine('postgresql://postgres@:5432/analyst_ui')
    conn = engine.connect()

    truncate_command = "TRUNCATE TABLE {}.{}".format(DATA_SCHEMA, DATA_TABLENAME)
    conn.execute(truncate_command)
    truncate_act_command = "TRUNCATE TABLE {}.{}".format(DATA_SCHEMA, ACTIVITY_DATA_TABLENAME)
    conn.execute(truncate_act_command)

    paginator = s3_client.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=IATI_BUCKET_NAME, Prefix=IATI_FOLDER_NAME)
    new_datasets = list()
    for page in page_iterator:
        new_datasets += [dataset['Key'][len(IATI_FOLDER_NAME):] for dataset in page['Contents']]

    bar = progressbar.ProgressBar()
    for dataset_id in bar(new_datasets):
        s3_object = s3_client.get_object(Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset_id)
        download_xml = s3_object['Body'].read()

        try:
            root = etree.fromstring(download_xml, parser=large_parser)
        except etree.XMLSyntaxError:
            continue

        flat_activities, flat_transactions = iatiflat.flatten_activities(root)
        if not flat_activities:
            continue

        flat_activity_data = pd.DataFrame(flat_activities)
        flat_activity_data.columns = activity_header
        flat_activity_data["package_id"] = dataset_id
        flat_activity_data["last_modified"] = current_timestamp
        for numeric_column in A_NUMERIC_DTYPES:
            flat_activity_data[numeric_column] = pd.to_numeric(flat_activity_data[numeric_column], errors='coerce')
        flat_activity_data = flat_activity_data.astype(dtype=A_DTYPES)

        flat_transaction_data = pd.DataFrame(flat_transactions)
        flat_transaction_data.columns = transaction_header
        flat_transaction_data["package_id"] = dataset_id
        for numeric_column in T_NUMERIC_DTYPES:
            flat_transaction_data[numeric_column] = pd.to_numeric(flat_transaction_data[numeric_column], errors='coerce')
        flat_transaction_data = flat_transaction_data.astype(dtype=T_DTYPES)

        flat_transaction_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists="append")
        flat_activity_data.to_sql(name=ACTIVITY_DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists="append")

    engine.dispose()


if __name__ == '__main__':
    main()
