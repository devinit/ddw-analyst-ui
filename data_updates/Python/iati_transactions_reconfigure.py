import os
import progressbar
import pandas as pd
from sqlalchemy import create_engine
from lxml import etree
from iati_transaction_spec import IatiFlat
import boto3


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
IATI_BUCKET_NAME = "di-s3"
IATI_FOLDER_NAME = "iati_registry/"

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


def main():
    iatiflat = IatiFlat()
    header = iatiflat.header

    # engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    engine = create_engine('postgresql://postgres@:5432/analyst_ui')

    if_exists = "replace"

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
            root = etree.fromstring(download_xml)
        except etree.XMLSyntaxError:
            continue

        flat_output = iatiflat.flatten_activities(root)
        if not flat_output:
            continue

        flat_data = pd.DataFrame(flat_output)
        flat_data.columns = header
        flat_data["package_id"] = dataset_id
        for numeric_column in NUMERIC_DTYPES:
            flat_data[numeric_column] = pd.to_numeric(flat_data[numeric_column], errors='coerce')
        flat_data = flat_data.astype(dtype=DTYPES)

        flat_data.to_sql(name=DATA_TABLENAME, con=engine, schema=DATA_SCHEMA, index=False, if_exists=if_exists)

        if if_exists == "replace":
            if_exists = "append"

    engine.dispose()


if __name__ == '__main__':
    main()
