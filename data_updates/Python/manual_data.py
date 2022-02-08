import pandas as pd
from sqlalchemy import create_engine
import glob
import os
import sys


def main(filename=None):

    dir_path = os.path.dirname(os.path.realpath(__file__))
    if filename:
        glob_path = os.path.join(dir_path, "..", "manual", "CSV", filename)
    else:
        glob_path = os.path.join(dir_path, "..", "manual", "CSV", "*.csv")
    csv_paths = glob.glob(glob_path)
    abs_csv_paths = [os.path.abspath(csv) for csv in csv_paths]
    if len(abs_csv_paths) < 1:
        raise FileNotFoundError('No file matching that name found. Please make sure the file exists')
    for abs_csv_path in abs_csv_paths:
        process_file(abs_csv_path)

def process_file(filename):
    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    basename = os.path.basename(filename)
    table_name = os.path.splitext(basename)[0]
    if table_name not in ["meta", "meta_columns"]:
        try:
            csv_dat = pd.read_csv(filename, keep_default_na=False, na_values=[''])
        except UnicodeDecodeError:
            csv_dat = pd.read_csv(filename, keep_default_na=False, na_values=[''], encoding='latin1')
        csv_dat.to_sql(name=table_name, con=engine, schema="repo", index=False, if_exists="replace")


if __name__ == '__main__':
    filename = None
    if len(sys.argv) == 2:
        filename = sys.argv[1]
    main(filename=filename)
