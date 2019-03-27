import requests
import pandas as pd
import io
from sqlalchemy import create_engine


def fetch_test_data():
    """Fetch data from PovCalNet at $1.90 poverty line."""
    url = "http://iresearch.worldbank.org/PovcalNet/PovcalNetAPI.ashx?"
    smy_params = {
        "Countries": "all",
        "GroupedBy": "WB",
        "PovertyLine": "1.9",
        "RefYears": "all",
        "Display": "C",
        "format": "csv"
    }

    smy_url = url + "&".join(["{}={}".format(item[0], item[1]) for item in smy_params.items()])

    s_response = requests.get(url=smy_url).content

    smy_data = pd.read_csv(io.StringIO(s_response.decode('utf-8')))

    return smy_data


def fetch_old_data(schema_name, table_name, boundary, engine):
    try:
        return pd.read_sql_query('SELECT * FROM "{}"."{}" WHERE {};'.format(schema_name, table_name, boundary), engine)
    except:
        return pd.DataFrame(columns=["CountryCode", "RequestYear", "PovertyLine","HeadCount"])


def data_is_the_same(new_data, old_data):
    id_vars = ["CountryCode", "RequestYear", "PovertyLine"]
    val_vars = id_vars + ["HeadCount"]
    n_sorted = new_data.sort_values(by=id_vars).round({'HeadCount': 3})[val_vars]
    o_sorted = old_data.sort_values(by=id_vars).round({'HeadCount': 3})[val_vars]
    return n_sorted.equals(o_sorted)


def fetch_and_write_full_data(schema_name, table_name, engine):
    pass



def main():
    engine = create_engine('postgresql://postgres@/analyst_ui')
    test_data = fetch_test_data()
    # test_data.to_sql(name="PovCalNetSmy", con=engine, schema="repo", index=False, if_exists="replace")
    existing_data = fetch_old_data("repo", "PovCalNetSmy", '"PovertyLine" = 1.9', engine)
    its_the_same = data_is_the_same(test_data, existing_data)
    if not its_the_same:
        fetch_and_write_full_data("repo", "PovCalNetSmy", engine)
    engine.dispose()


if __name__ == '__main__':
    main()
