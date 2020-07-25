import os
import argparse
import progressbar
import pandas as pd
import sqlalchemy
from sqlalchemy import and_, create_engine, MetaData, or_, Table
from lxml import etree
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
    iatiflat = IatiFlat()
    header = iatiflat.header

    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    # engine = create_engine('postgresql://postgres@:5432/analyst_ui')
    conn = engine.connect()
    meta = MetaData(engine)
    meta.reflect()
    try:
        datasets = Table(METADATA_TABLENAME, meta, schema=METADATA_SCHEMA, autoload=True)
    except sqlalchemy.exc.NoSuchTableError:
        raise ValueError("No database found. Try running `iati_refresh.py` first.")
    try:
        transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
        if_exists = "append"
    except sqlalchemy.exc.NoSuchTableError:
        if_exists = "replace"

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

    repeat_package_ids = list()
    repeat_activity_ids = list()
    bar = progressbar.ProgressBar()
    new_datasets = conn.execute(datasets.select().where(dataset_filter)).fetchall()
    for dataset in bar(new_datasets):
        download_xml = ""
        try:
            download_xml = requests_retry_session(retries=3).get(url=dataset["url"], timeout=5).content
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(new=False, modified=False, stale=False, error=False))
        except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError):
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(error=True))
            continue

        s3_client.put_object(Body=download_xml, Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset['id'])

        try:
            root = etree.fromstring(download_xml)
        except etree.XMLSyntaxError:
            continue

        activities = root.findall("iati-activity")

        for activity in activities:
            flat_output = iatiflat.flatten_activity(activity)
            if not flat_output:
                continue

            flat_data = pd.DataFrame(flat_output)
            flat_data.columns = header
            flat_data["package_id"] = dataset["id"]
            flat_data["last_modified"] = current_timestamp
            for numeric_column in NUMERIC_DTYPES:
                flat_data[numeric_column] = pd.to_numeric(flat_data[numeric_column], errors='coerce')
            flat_data = flat_data.astype(dtype=DTYPES)

            if if_exists == "append":
                repeat_ids = flat_data.iati_identifier.unique().tolist()
                repeat_package_ids.append(dataset["id"])
                repeat_activity_ids += repeat_ids

            flat_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists=if_exists)

            if if_exists == "replace":
                transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
                if_exists = "append"

    repeat_filter = or_(
        and_(
            transaction_table.c.package_id.in_(repeat_package_ids),
            transaction_table.c.last_modified != current_timestamp
        ),
        and_(
            transaction_table.c.iati_refresh.in_(repeat_activity_ids),
            transaction_table.c.last_modified != current_timestamp
        )
    )
    del_st = transaction_table.delete().where(repeat_filter)
    conn.execute(del_st)

    stale_datasets = conn.execute(datasets.select().where(datasets.c.stale == True)).fetchall()
    for dataset in stale_datasets:
        conn.execute(datasets.delete().where(datasets.c.id == dataset["id"]))
        conn.execute(transaction_table.delete().where(transaction_table.c.package_id == dataset["id"]))
        s3_client.delete_object(Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset['id'])

    engine.dispose()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load IATI Registry packages.')
    parser.add_argument('-e', '--errors', dest='errors', action='store_true', default=False, help="Attempt to download previous errors")
    args = parser.parse_args()
    main(args)
