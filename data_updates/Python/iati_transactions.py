import os
import argparse
import progressbar
import pandas as pd
import sqlalchemy
from sqlalchemy import and_, distinct, create_engine, MetaData, or_, select, Table
from lxml import etree
from lxml.etree import XMLParser
from iati_transaction_spec import IatiFlat, DTYPES, NUMERIC_DTYPES
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from requests.packages.urllib3.exceptions import InsecureRequestWarning
import boto3
from datetime import datetime


current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

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


METADATA_SCHEMA = "repo"
METADATA_TABLENAME = "iati_registry_metadata"
DATA_SCHEMA = "repo"
DATA_TABLENAME = "iati_transactions"
TMP_DATA_SCHEMA = "repo"
TMP_DATA_TABLENAME = "tmpiati_transactions"
IATI_BUCKET_NAME = "di-s3"
IATI_FOLDER_NAME = "iati_registry/"


def requests_retry_session(
    retries=10,
    backoff_factor=0.3,
    status_forcelist=(),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


def main(args):
    large_parser = XMLParser(huge_tree=True)
    iatiflat = IatiFlat()
    header = iatiflat.header

    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    # engine = create_engine('postgresql://postgres@:5432/analyst_ui')
    conn = engine.connect()
    meta = MetaData(engine)
    meta.reflect()
    disable_trigger_command = "ALTER TABLE {}.{} DISABLE TRIGGER ALL".format(DATA_SCHEMA, DATA_TABLENAME)
    enable_trigger_command = "ALTER TABLE {}.{} ENABLE TRIGGER ALL".format(DATA_SCHEMA, DATA_TABLENAME)
    try:
        datasets = Table(METADATA_TABLENAME, meta, schema=METADATA_SCHEMA, autoload=True)
    except sqlalchemy.exc.NoSuchTableError:
        raise ValueError("No database found. Try running `iati_refresh.py` first.")
    try:
        transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
        first_run = False
    except sqlalchemy.exc.NoSuchTableError:
        first_run = True
    try:
        # Was stopped in the middle of processing
        tmp_transaction_table = Table(TMP_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, autoload=True)
        conn.execute(disable_trigger_command)
        repeat_id_tuples = conn.execute(select([distinct(tmp_transaction_table.c.package_id)])).fetchall()
        repeat_ids = [repeat_id_tuple[0] for repeat_id_tuple in repeat_id_tuples]
        if repeat_ids:
            conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(repeat_ids)))
        insert_command = "INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_DATA_TABLENAME)
        conn.execute(insert_command)
        drop_command = "DROP TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_DATA_TABLENAME)
        conn.execute(drop_command)
        conn.execute(enable_trigger_command)
    except sqlalchemy.exc.NoSuchTableError:
        pass

    if args.errors:
        dataset_filter = datasets.c.error == True
    else:
        dataset_filter = and_(
            or_(
                datasets.c.new == True,
                datasets.c.modified == True
            ),
            datasets.c.error == False
        )

    if_exists = "replace"
    bar = progressbar.ProgressBar()
    new_datasets = conn.execute(datasets.select().where(dataset_filter)).fetchall()
    modified_package_ids = [dataset["id"] for dataset in new_datasets if dataset["modified"] or dataset["error"]]
    for dataset in bar(new_datasets):
        download_xml = ""
        try:
            download_xml = requests_retry_session(retries=3).get(url=dataset["url"], timeout=5).content
            download_success = True
        except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError):
            download_success = False
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(error=True))
            continue

        s3_client.put_object(Body=download_xml, Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset['id'])

        if download_success:
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(new=False, modified=False, stale=False, error=False))

        try:
            root = etree.fromstring(download_xml, parser=large_parser)
        except etree.XMLSyntaxError:
            continue

        flat_output = iatiflat.flatten_activities(root)
        if not flat_output:
            continue

        flat_data = pd.DataFrame(flat_output)
        flat_data.columns = header
        flat_data["package_id"] = dataset["id"]
        flat_data["last_modified"] = current_timestamp
        for numeric_column in NUMERIC_DTYPES:
            flat_data[numeric_column] = pd.to_numeric(flat_data[numeric_column], errors='coerce')
        flat_data = flat_data.astype(dtype=DTYPES)

        if first_run:
            flat_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists=if_exists)
            if if_exists == "replace":
                transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
                if_exists = "append"
        else:
            flat_data.to_sql(name=TMP_DATA_TABLENAME, con=engine, schema=TMP_DATA_SCHEMA, index=False, if_exists=if_exists)

            if if_exists == "replace":
                if_exists = "append"

    # Delete repeats, insert tmp into permanent, erase tmp
    if not first_run:
        conn.execute(disable_trigger_command)
        if modified_package_ids:
            conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(modified_package_ids)))
        try:
            tmp_transaction_table = Table(TMP_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, autoload=True)
            insert_command = "INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_DATA_TABLENAME)
            conn.execute(insert_command)
            drop_command = "DROP TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_DATA_TABLENAME)
            conn.execute(drop_command)
        except sqlalchemy.exc.NoSuchTableError:  # In case nothing was inserted into tmp table during update
            pass
        conn.execute(enable_trigger_command)


    if not first_run:
        stale_datasets = conn.execute(datasets.select().where(datasets.c.stale == True)).fetchall()
        stale_dataset_ids = [dataset["id"] for dataset in stale_datasets]
        conn.execute(datasets.delete().where(datasets.c.id.in_(stale_dataset_ids)))
        conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(stale_dataset_ids)))
        for dataset in stale_datasets:
            s3_client.delete_object(Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset['id'])

    engine.dispose()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load IATI Registry packages.')
    parser.add_argument('-e', '--errors', dest='errors', action='store_true', default=False, help="Attempt to download previous errors")
    args = parser.parse_args()
    main(args)
