import os
import argparse
import progressbar
import pandas as pd
import sqlalchemy
from sqlalchemy import and_, create_engine, MetaData, or_, Table
from lxml import etree
from iati_transaction_spec import IatiFlat
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from requests.packages.urllib3.exceptions import InsecureRequestWarning


requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


METADATA_SCHEMA = "repo"
METADATA_TABLENAME = "iati_registry_metadata"
DATA_SCHEMA = "repo"
DATA_TABLENAME = "iati_transactions"
DATA_WRITE_LOCATION = "/iati_data"

DTYPES = {
    'iati_identifier': 'object',
    'x_transaction_number': 'float64',
    'reporting_org_ref': 'object',
    'reporting_org_narrative': 'object',
    'reporting_org_secondary_reporter': 'object',
    'reporting_org_type_code': 'object',
    'title_narrative': 'object',
    'recipient_country_code': 'object',
    'recipient_country_percentage': 'object',
    'transaction_recipient_country_code': 'object',
    'x_country_code': 'object',
    'x_country_percentage': 'object',
    'recipient_region_vocabulary': 'object',
    'recipient_region_code': 'object',
    'recipient_region_percentage': 'object',
    'transaction_recipient_region_vocabulary': 'object',
    'transaction_recipient_region_code': 'object',
    'x_region_vocabulary': 'object',
    'x_region_code': 'object',
    'x_region_percentage': 'object',
    'sector_vocabulary': 'object',
    'sector_code': 'object',
    'sector_percentage': 'object',
    'transaction_sector_vocabulary': 'object',
    'transaction_sector_code': 'object',
    'x_sector_vocabulary': 'object',
    'x_default_vocabulary': 'object',
    'x_sector_code': 'object',
    'x_sector_percentage': 'object',
    'x_dac3_sector_code': 'object',
    'transaction_type_code': 'object',
    'transaction_date_iso_date': 'object',
    'transaction_value_date': 'object',
    'x_transaction_date': 'object',
    'x_transaction_year': 'float64',
    'default_currency': 'object',
    'transaction_value_currency': 'object',
    'x_currency': 'object',
    'transaction_value': 'float64',
    'x_transaction_value': 'float64',
    'x_transaction_value_usd': 'float64',
    'default_flow_type_code': 'object',
    'transaction_flow_type_code': 'object',
    'x_flow_type_code': 'object',
    'default_finance_type_code': 'object',
    'transaction_finance_type_code': 'object',
    'x_finance_type_code': 'object',
    'default_aid_type_vocabulary': 'object',
    'default_aid_type_code': 'object',
    'transaction_aid_type_vocabulary': 'object',
    'transaction_aid_type_code': 'object',
    'x_mod_aid_type_vocabulary': 'object',
    'x_mod_aid_type_code': 'object',
    'x_dac_aid_type_code': 'object',
    'default_tied_status_code': 'object',
    'transaction_tied_status_code': 'object',
    'x_tied_status_code': 'object',
    'transaction_disbursement_channel_code': 'object',
    'description_narrative': 'object',
    'transaction_description_narrative': 'object',
    'humanitarian': 'object',
    'transaction_humanitarian': 'object',
    'humanitarian_scope_type': 'object',
    'humanitarian_scope_vocabulary': 'object',
    'humanitarian_scope_code': 'object',
    'humanitarian_scope_narrative': 'object',
    'x_hum_emergency_vocabulary': 'object',
    'x_hum_emergency_code': 'object',
    'x_hum_appeal_vocabulary': 'object',
    'x_hum_appeal_code': 'object',
    'transaction_provider_org_narrative': 'object',
    'transaction_provider_org_provider_activity_id': 'object',
    'transaction_provider_org_ref': 'object',
    'transaction_provider_org_type': 'object',
    'transaction_receiver_org_narrative': 'object',
    'transaction_receiver_org_receiver_activity_id': 'object',
    'transaction_receiver_org_ref': 'object',
    'transaction_receiver_org_type': 'object',
    'transaction_ref': 'object',
    'participating_org_narrative': 'object',
    'participating_org_type': 'object',
    'participating_org_role': 'object',
    'participating_org_ref': 'object',
    'tag_narrative': 'object',
    'tag_vocabulary': 'object',
    'tag_code': 'object',
    'x_reporting_org_type': 'object',
    'x_transaction_type': 'object',
    'x_country': 'object',
    'x_finance_type': 'object',
    'x_aid_type': 'object',
    'x_dac3_sector': 'object',
    'x_di_sector': 'object',
    'package_id': 'object'
}
NUMERIC_DTYPES = [column_name for column_name, dtype in DTYPES.items() if dtype != "object"]


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

    bar = progressbar.ProgressBar()
    new_datasets = conn.execute(datasets.select().where(dataset_filter)).fetchall()
    for dataset in bar(new_datasets):
        download_xml = ""
        download_filepath = os.path.join(DATA_WRITE_LOCATION, dataset['id'])
        try:
            download_xml = requests_retry_session(retries=3).get(url=dataset["url"], timeout=5).content
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(new=False, modified=False, stale=False, error=False))
            with open(download_filepath, 'wb') as xml_file:
                xml_file.write(download_xml)
        except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError):
            conn.execute(datasets.update().where(datasets.c.id == dataset["id"]).values(error=True))
            continue

        try:
            root = etree.fromstring(download_xml)
        except etree.XMLSyntaxError:
            continue

        flat_output = iatiflat.flatten_activities(root)
        if not flat_output:
            continue

        flat_data = pd.DataFrame(flat_output)
        flat_data.columns = header
        flat_data["package_id"] = dataset["id"]
        for numeric_column in NUMERIC_DTYPES:
            flat_data[numeric_column] = pd.to_numeric(flat_data[numeric_column], errors='coerce')
        flat_data = flat_data.astype(dtype=DTYPES)

        if if_exists == "append":
            repeat_ids = flat_data.iati_identifier.unique().tolist()
            del_st = transaction_table.delete().where(transaction_table.c.iati_identifier.in_(repeat_ids))
            conn.execute(del_st)

        flat_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists=if_exists)

        if if_exists == "replace":
            transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
            if_exists = "append"

    stale_datasets = conn.execute(datasets.select().where(datasets.c.stale == True)).fetchall()
    for dataset in stale_datasets:
        download_filepath = os.path.join(DATA_WRITE_LOCATION, dataset['id'])
        conn.execute(datasets.delete().where(datasets.c.id == dataset["id"]))
        conn.execute(transaction_table.delete().where(transaction_table.c.package_id == dataset["id"]))
        os.remove(download_filepath)

    engine.dispose()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load IATI Registry packages.')
    parser.add_argument('-e', '--errors', dest='errors', action='store_true', default=False, help="Attempt to download previous errors")
    args = parser.parse_args()
    main(args)
