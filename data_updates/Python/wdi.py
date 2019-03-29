import requests
import pandas as pd
from sqlalchemy import create_engine
import constants
import os
import shutil
from zipfile import ZipFile
import progressbar


def download_file(url):
    local_filename = url.split('/')[-1]
    tmp_filename = os.path.join(constants.TMP_DOWNLOAD_PATH, local_filename)
    with requests.get(url, stream=True) as r:
        with open(tmp_filename, 'wb') as f:
            shutil.copyfileobj(r.raw, f)

    return tmp_filename


def wide_to_long_wdi(csv_file_in, csv_file_out):
    with open(csv_file_in) as f, open(csv_file_out, 'w') as f2:
        f2.write('"country_name","country_code","indicator_name","indicator_code","year","value"\n')
        for i, line in progressbar.progressbar(enumerate(f)):
            if i == 0:
                headers = line.strip().split('","')
                headers = [h.replace("\ufeff", "").replace('",', '').replace('"', '').lower().replace(" ", "_") for h in headers]
                headers.pop()
                years = headers[4:]
            else:
                country_name, country_code, indicator_name, indicator_code, *rest = line.strip().split('","')
                country_name = country_name.replace('"', '')
                rest = [r.replace('",', '').replace('"', '') for r in rest]
                rest.pop()
                for year, value in zip(years, rest):
                    data_row = ['"{0}"'.format(c) for c in [country_name, country_code, indicator_name, indicator_code, year, value]]
                    f2.write(','.join(data_row) + '\n')
    return csv_file_out


def main():
    ckan_url = "https://datacatalog.worldbank.org/api/3/action/package_show?id=90a34ea4-8a5c-11e6-ae22-56b6b64001"
    ckan_response = requests.get(url=ckan_url).json()
    resources = ckan_response["result"][0]["resources"]
    resource_names = [res["name"] for res in resources]
    csv_index = resource_names.index("CSV")
    csv_resource = resources[csv_index]
    csv_url = csv_resource["url"]
    tmp_zip = download_file(csv_url)
    tmp_csv = ZipFile(tmp_zip).extract(member="WDIData.csv", path=constants.TMP_DOWNLOAD_PATH)
    tmp_csv_long = wide_to_long_wdi(tmp_csv, os.path.join(constants.TMP_DOWNLOAD_PATH, "wdi_long.csv"))
    wdi = pd.read_csv(tmp_csv_long)
    engine = create_engine('postgresql://postgres@/analyst_ui')
    wdi.to_sql(name="wdi", con=engine, schema="repo", index=False, if_exists="replace", chunksize=1000)
    engine.dispose()


if __name__ == '__main__':
    main()
