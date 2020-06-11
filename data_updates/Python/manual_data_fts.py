import pandas as pd
from sqlalchemy import create_engine
import glob
import os


def main():
    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    # engine = create_engine('postgresql://postgres@/analyst_ui')

    dir_path = os.path.dirname(os.path.realpath(__file__))
    glob_path = os.path.join(dir_path, "..", "manual", "fts_dependencies", "*.csv")
    csv_paths = glob.glob(glob_path)
    abs_csv_paths = [os.path.abspath(csv) for csv in csv_paths]
    for abs_csv_path in abs_csv_paths:
        basename = os.path.basename(abs_csv_path)
        table_name = os.path.splitext(basename)[0]
        if table_name not in ["meta", "meta_columns"]:
            csv_dat = pd.read_csv(abs_csv_path, keep_default_na=False, na_values=[''], encoding='latin1')
            csv_dat.to_sql(name=table_name, con=engine, schema="repo", index=False, if_exists="replace")


if __name__ == '__main__':
    main()
