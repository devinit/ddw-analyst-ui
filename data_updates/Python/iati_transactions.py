import requests
import json
import progressbar
import pandas as pd
from datetime import datetime
import sqlalchemy
from sqlalchemy.dialects.postgresql import TEXT, BIGINT, DOUBLE_PRECISION
from sqlalchemy import create_engine, MetaData, Table
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from lxml import etree
import numpy as np
from iati_transaction_spec import IatiFlat


LAST_RUN_FILENAME = "/tmp/iati_registry_last_run.txt"
DATA_SCHEMA = "repo"
DATA_TABLENAME = "iati_transactions"

DTYPES = {
    'iati_identifier':  'object',
    'x_transaction_number':  'int64',
    'reporting_org_ref':  'object',
    'reporting_org_narrative':  'object',
    'reporting_org_secondary_reporter':  'object',
    'reporting_org_type_code':  'object',
    'title_narrative':  'object',
    'recipient_country_code':  'object',
    'recipient_country_percentage':  'object',
    'transaction_recipient_country_code':  'object',
    'x_country_code':  'object',
    'x_country_percentage':  'object',
    'recipient_region_vocabulary':  'object',
    'recipient_region_code':  'object',
    'recipient_region_percentage':  'object',
    'transaction_recipient_region_vocabulary':  'object',
    'transaction_recipient_region_code':  'object',
    'x_region_vocabulary':  'object',
    'x_region_code':  'object',
    'x_region_percentage':  'object',
    'sector_vocabulary':  'object',
    'sector_code':  'object',
    'sector_percentage':  'object',
    'transaction_sector_vocabulary':  'object',
    'transaction_sector_code':  'object',
    'x_sector_vocabulary':  'object',
    'x_default_vocabulary':  'object',
    'x_sector_code':  'object',
    'x_sector_percentage':  'object',
    'x_dac3_sector_code':  'object',
    'transaction_type_code':  'object',
    'transaction_date_iso_date':  'object',
    'transaction_value_date':  'object',
    'x_transaction_date':  'object',
    'x_transaction_year':  'int64',
    'default_currency':  'object',
    'transaction_value_currency':  'object',
    'x_currency':  'object',
    'transaction_value':  'float64',
    'x_transaction_value':  'float64',
    'x_transaction_value_usd':  'float64',
    'default_flow_type_code':  'object',
    'transaction_flow_type_code':  'object',
    'x_flow_type_code':  'object',
    'default_finance_type_code':  'object',
    'transaction_finance_type_code':  'object',
    'x_finance_type_code':  'object',
    'default_aid_type_vocabulary':  'object',
    'default_aid_type_code':  'object',
    'transaction_aid_type_vocabulary':  'object',
    'transaction_aid_type_code':  'object',
    'x_mod_aid_type_vocabulary':  'object',
    'x_mod_aid_type_code':  'object',
    'x_dac_aid_type_code':  'object',
    'default_tied_status_code':  'object',
    'transaction_tied_status_code':  'object',
    'x_tied_status_code':  'object',
    'transaction_disbursement_channel_code':  'object',
    'description_narrative':  'object',
    'transaction_description_narrative':  'object',
    'humanitarian':  'object',
    'transaction_humanitarian':  'object',
    'humanitarian_scope_type':  'object',
    'humanitarian_scope_vocabulary':  'object',
    'humanitarian_scope_code':  'object',
    'humanitarian_scope_narrative':  'object',
    'x_hum_emergency_vocabulary':  'object',
    'x_hum_emergency_code':  'object',
    'x_hum_appeal_vocabulary':  'object',
    'x_hum_appeal_code':  'object',
    'transaction_provider_org_narrative':  'object',
    'transaction_provider_org_provider_activity_id':  'object',
    'transaction_provider_org_ref':  'object',
    'transaction_provider_org_type':  'object',
    'transaction_receiver_org_narrative':  'object',
    'transaction_receiver_org_receiver_activity_id':  'object',
    'transaction_receiver_org_ref':  'object',
    'transaction_receiver_org_type':  'object',
    'transaction_ref':  'object',
    'participating_org_narrative':  'object',
    'participating_org_type':  'object',
    'participating_org_role':  'object',
    'participating_org_ref':  'object',
    'tag_narrative':  'object',
    'tag_vocabulary':  'object',
    'tag_code':  'object'
}



def read_last_run():
    try:
        with open(LAST_RUN_FILENAME, "r") as lrf:
            return lrf.readline().strip()
    except FileNotFoundError:
        return "0000-01-01T00:00:00Z"


def write_last_run():
    with open(LAST_RUN_FILENAME, "w") as lrf:
        last_run = datetime.now().strftime('%Y-%m-%d')+"T00:00:00Z"
        lrf.write(last_run)


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


def fetch_urls_since_last_run():
    results = []
    last_run = read_last_run()
    api_url = "https://iatiregistry.org/api/3/action/package_search?fq=metadata_modified:%5B{}%20TO%20NOW%5D&rows=1000".format(last_run)
    response = requests_retry_session().get(url=api_url, timeout=30).content
    json_response = json.loads(response)
    full_count = json_response["result"]["count"]
    current_count = len(json_response["result"]["results"])
    results += [resource["url"] for result in json_response["result"]["results"] for resource in result["resources"]]
    while current_count < full_count:
        next_api_url = "{}&start={}".format(api_url, current_count)
        response = requests_retry_session().get(url=next_api_url, timeout=30).content
        json_response = json.loads(response)
        current_count += len(json_response["result"]["results"])
        results += [resource["url"] for result in json_response["result"]["results"] for resource in result["resources"]]
    return results


def main():
    iatiflat = IatiFlat()
    header = iatiflat.header

    # engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    engine = create_engine('postgresql://postgres@:5432/analyst_ui')
    conn = engine.connect()
    meta = MetaData(engine)
    meta.reflect()
    try:
        transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
        if_exists = "append"
    except sqlalchemy.exc.NoSuchTableError:
        if_exists = "replace"

    download_urls = fetch_urls_since_last_run()
    bar = progressbar.ProgressBar()
    for download_url in bar(download_urls):
        download_data = requests_retry_session().get(url=download_url, timeout=30).content
        try:
            root = etree.fromstring(download_data)
        except etree.XMLSyntaxError:
            continue

        flat_output = iatiflat.flatten_activities(root)
        if not flat_output:
            continue

        flat_data = pd.DataFrame(flat_output)
        flat_data.columns = header
        flat_data = flat_data.replace(r'^\s*$', np.nan, regex=True)
        flat_data = flat_data.astype(dtype=DTYPES)

        if if_exists == "append":
            repeat_ids = flat_data.iati_identifier.unique().tolist()
            del_st = transaction_table.delete().where(transaction_table.c.iati_identifier in repeat_ids)
            conn.execute(del_st)

        flat_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists=if_exists)

        if if_exists == "replace":
            transaction_table = Table(DATA_TABLENAME, meta, schema=DATA_SCHEMA, autoload=True)
            if_exists = "append"

    engine.dispose()
    write_last_run()


if __name__ == '__main__':
    main()
