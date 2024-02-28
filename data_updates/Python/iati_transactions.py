import os
import argparse
import progressbar
import pandas as pd
import sqlalchemy
from sqlalchemy import and_, distinct, create_engine, MetaData, or_, select, Table, text, Column
from lxml import etree
from lxml.etree import XMLParser
from iati_transaction_spec import IatiFlat, A_DTYPES, A_NUMERIC_DTYPES, T_DTYPES, T_NUMERIC_DTYPES
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
DATA_TABLENAME = "iati_transactions2"
ACTIVITY_DATA_TABLENAME = "iati_activities"
TMP_DATA_SCHEMA = "repo"
TMP_DATA_TABLENAME = "tmpiati_transactions"
TMP_ACTIVITY_DATA_TABLENAME = "tmpiati_activities"
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
    activity_header = iatiflat.activity_header
    transaction_header = iatiflat.transaction_header

    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    # engine = create_engine('postgresql://postgres@:5432/analyst_ui')
    meta = MetaData()
    meta.reflect(engine)
    disable_trigger_command = text("ALTER TABLE {}.{} DISABLE TRIGGER ALL".format(DATA_SCHEMA, DATA_TABLENAME))
    enable_trigger_command = text("ALTER TABLE {}.{} ENABLE TRIGGER ALL".format(DATA_SCHEMA, DATA_TABLENAME))
    disable_activity_trigger_command = text("ALTER TABLE {}.{} DISABLE TRIGGER ALL".format(DATA_SCHEMA, ACTIVITY_DATA_TABLENAME))
    enable_activity_trigger_command = text("ALTER TABLE {}.{} ENABLE TRIGGER ALL".format(DATA_SCHEMA, ACTIVITY_DATA_TABLENAME))
    try:
        datasets = Table(METADATA_TABLENAME, meta, schema=METADATA_SCHEMA, autoload_with=engine)
    except sqlalchemy.exc.NoSuchTableError:
        raise ValueError("No database found. Try running `iati_refresh.py` first.")
    try:
        transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload_with=engine)
        activity_table = Table(ACTIVITY_DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload_with=engine)
    except sqlalchemy.exc.NoSuchTableError:
        raise ValueError("Please create the required tables first.")

    recover_from_early_stop = False
    try:
        tmp_activity_table = Table(TMP_ACTIVITY_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, autoload_with=engine)
        recover_from_early_stop = True
    except sqlalchemy.exc.NoSuchTableError:
        activity_columns = [Column(desc.name, desc.type) for desc in activity_table.c]
        tmp_activity_table = Table(TMP_ACTIVITY_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, *activity_columns)
        tmp_activity_table.create(engine)
    try:
        tmp_transaction_table = Table(TMP_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, autoload_with=engine)
        recover_from_early_stop = True
    except sqlalchemy.exc.NoSuchTableError:
        transaction_columns = [Column(desc.name, desc.type) for desc in transaction_table.c]
        tmp_transaction_table = Table(TMP_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, *transaction_columns)
        tmp_transaction_table.create(engine)
    if recover_from_early_stop:
        with engine.begin() as conn:
            conn.execute(disable_trigger_command)
            conn.execute(disable_activity_trigger_command)
            repeat_id_tuples = conn.execute(select(distinct(tmp_activity_table.c.package_id))).fetchall()
        repeat_ids = [repeat_id_tuple[0] for repeat_id_tuple in repeat_id_tuples]
        if repeat_ids:
            with engine.begin() as conn:
                conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(repeat_ids)))
                conn.execute(activity_table.delete().where(activity_table.c.package_id.in_(repeat_ids)))
        insert_command = text("INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_DATA_TABLENAME))
        truncate_command = text("TRUNCATE TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_DATA_TABLENAME))
        insert_act_command = text("INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, ACTIVITY_DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_ACTIVITY_DATA_TABLENAME))
        truncate_act_command = text("TRUNCATE TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_ACTIVITY_DATA_TABLENAME))
        with engine.begin() as conn:
            conn.execute(insert_command)
            conn.execute(truncate_command)
            conn.execute(enable_trigger_command)
            conn.execute(insert_act_command)
            conn.execute(truncate_act_command)
            conn.execute(enable_activity_trigger_command)

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

    bar = progressbar.ProgressBar()
    with engine.begin() as conn:
        new_datasets = conn.execute(datasets.select().where(dataset_filter)).fetchall()
    modified_package_ids = [dataset.id for dataset in new_datasets if dataset.modified or dataset.error]
    for dataset in bar(new_datasets):
        download_xml = ""
        try:
            download_xml = requests_retry_session(retries=3).get(url=dataset.url, timeout=5).content
            download_success = True
        except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError, requests.exceptions.InvalidSchema):
            download_success = False
            with engine.begin() as conn:
                conn.execute(datasets.update().where(datasets.c.id == dataset.id).values(error=True))
            continue

        s3_client.put_object(Body=download_xml, Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset.id)

        if download_success:
            with engine.begin() as conn:
                conn.execute(datasets.update().where(datasets.c.id == dataset.id).values(new=False, modified=False, stale=False, error=False))

        try:
            root = etree.fromstring(download_xml, parser=large_parser)
        except etree.XMLSyntaxError:
            continue

        flat_activities, flat_transactions = iatiflat.flatten_activities(root)
        if not flat_activities:
            continue

        flat_activity_data = pd.DataFrame(flat_activities)
        flat_activity_data.columns = activity_header
        flat_activity_data["package_id"] = dataset.id
        flat_activity_data["last_modified"] = current_timestamp
        for numeric_column in A_NUMERIC_DTYPES:
            flat_activity_data[numeric_column] = pd.to_numeric(flat_activity_data[numeric_column], errors='coerce')
        flat_activity_data = flat_activity_data.astype(dtype=A_DTYPES)

        with engine.begin() as conn:
            flat_activity_data.to_sql(name=TMP_ACTIVITY_DATA_TABLENAME, con=conn, schema=DATA_SCHEMA, index=False, if_exists="append")

        if not flat_transactions:
            continue

        flat_transaction_data = pd.DataFrame(flat_transactions)
        flat_transaction_data.columns = transaction_header
        flat_transaction_data["package_id"] = dataset.id
        for numeric_column in T_NUMERIC_DTYPES:
            flat_transaction_data[numeric_column] = pd.to_numeric(flat_transaction_data[numeric_column], errors='coerce')
        flat_transaction_data = flat_transaction_data.astype(dtype=T_DTYPES)

        with engine.begin() as conn:
            flat_transaction_data.to_sql(name=TMP_DATA_TABLENAME, con=conn, schema=DATA_SCHEMA, index=False, if_exists="append")

    # Delete repeats, insert tmp into permanent, erase tmp
    with engine.begin() as conn:
        conn.execute(disable_trigger_command)
        conn.execute(disable_activity_trigger_command)
    if modified_package_ids:
        with engine.begin() as conn:
            conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(modified_package_ids)))
            conn.execute(activity_table.delete().where(activity_table.c.package_id.in_(modified_package_ids)))
    try:
        tmp_activity_table = Table(TMP_ACTIVITY_DATA_TABLENAME, meta, schema=TMP_DATA_SCHEMA, autoload_with=engine)
        insert_act_command = text("INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, ACTIVITY_DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_ACTIVITY_DATA_TABLENAME))
        drop_act_command = text("DROP TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_ACTIVITY_DATA_TABLENAME))
        with engine.begin() as conn:
            conn.execute(insert_act_command)
            conn.execute(drop_act_command)
    except sqlalchemy.exc.NoSuchTableError:  # In case nothing was inserted into tmp activity table during update
        pass
    try:
        insert_command = text("INSERT INTO {}.{} (SELECT * FROM {}.{})".format(DATA_SCHEMA, DATA_TABLENAME, TMP_DATA_SCHEMA, TMP_DATA_TABLENAME))
        drop_command = text("DROP TABLE {}.{}".format(TMP_DATA_SCHEMA, TMP_DATA_TABLENAME))
        with engine.begin() as conn:
            conn.execute(insert_command)
            conn.execute(drop_command)
    except sqlalchemy.exc.NoSuchTableError:  # In case nothing was inserted into tmp transaction table during update
        pass
    with engine.begin() as conn:
        conn.execute(enable_trigger_command)
        conn.execute(enable_activity_trigger_command)

    with engine.begin() as conn:
        stale_datasets = conn.execute(datasets.select().where(datasets.c.stale == True)).fetchall()
    stale_dataset_ids = [dataset.id for dataset in stale_datasets]
    with engine.begin() as conn:
        conn.execute(datasets.delete().where(datasets.c.id.in_(stale_dataset_ids)))
        conn.execute(transaction_table.delete().where(transaction_table.c.package_id.in_(stale_dataset_ids)))
        conn.execute(activity_table.delete().where(activity_table.c.package_id.in_(stale_dataset_ids)))
    for dataset in stale_datasets:
        s3_client.delete_object(Bucket=IATI_BUCKET_NAME, Key=IATI_FOLDER_NAME+dataset.id)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load IATI Registry packages.')
    parser.add_argument('-e', '--errors', dest='errors', action='store_true', default=False, help="Attempt to download previous errors")
    args = parser.parse_args()
    main(args)
