import requests
import pandas as pd
import io
from sqlalchemy import create_engine
import progressbar
import numpy as np
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


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


def fetch_data(poverty_line):
    """Fetch data from PovCalNet at poverty_line."""
    url = "http://iresearch.worldbank.org/PovcalNet/PovcalNetAPI.ashx?"
    agg_params = {
        "Countries": "all",
        "GroupedBy": "WB",
        "povertyLine": str(poverty_line),
        "RefYears": "all",
        "Display": "Regional",
        "format": "csv"
    }

    agg_url = url + "&".join(["{}={}".format(item[0], item[1]) for item in agg_params.items()])
    try:
        a_response = requests_retry_session().get(url=agg_url, timeout=30).content
        return pd.read_csv(io.StringIO(a_response.decode('utf-8')))
    except:
        print("Fetch for poverty-line {} failed".format(poverty_line))
        return pd.DataFrame(columns=["regionCID", "requestYear", "povertyLine", "hc"])


def fetch_old_data(schema_name, table_name, boundary, engine):
    try:
        return pd.read_sql_query('SELECT * FROM "{}"."{}" WHERE {};'.format(schema_name, table_name, boundary), engine)
    except:
        return pd.DataFrame(columns=["regionCID", "requestYear", "povertyLine", "hc"])


def data_is_the_same(new_data, old_data):
    id_vars = ["regionCID", "requestYear", "povertyLine"]
    val_vars = id_vars + ["hc"]
    n_sorted = new_data.sort_values(by=id_vars).round({'hc': 3})[val_vars]
    o_sorted = old_data.sort_values(by=id_vars).round({'hc': 3})[val_vars]
    return n_sorted.equals(o_sorted)


def fetch_and_write_full_data(schema_name, table_name, engine):
    append_or_replace = "replace"
    for povline in progressbar.progressbar(np.linspace(0.01, 10, 1000)):
        pov_data = fetch_data(poverty_line=povline)
        pov_data.to_sql(name="PovCalNetAgg", con=engine, schema="repo", index=False, if_exists=append_or_replace)
        append_or_replace = "append"


def main():
    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    test_data = fetch_data(poverty_line=1.9)
    existing_data = fetch_old_data("repo", "PovCalNetAgg", '"povertyLine" = 1.9', engine)
    its_the_same = data_is_the_same(test_data, existing_data)
    if not its_the_same:
        fetch_and_write_full_data("repo", "PovCalNetAgg", engine)
    else:
        print("No changes detected.")
    engine.dispose()


if __name__ == '__main__':
    main()
