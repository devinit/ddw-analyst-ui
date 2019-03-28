import pandas as pd
from sqlalchemy import create_engine


def main():
    engine = create_engine('postgresql://postgres@/analyst_ui')
    smy = pd.read_sql_table("PovCalNetSmy", con=engine, schema="repo")
    agg = pd.read_sql_table("PovCalNetAgg", con=engine, schema="repo")

    world = agg[agg["regionCID"] == "WLD"].copy()

    world["diff"] = abs(world["hc"]-0.2)

    unique_years = world["requestYear"].unique()
    p20_data_list = list()
    for unique_year in unique_years:
        year_min = min(world[(world["requestYear"] == unique_year)]["diff"])
        p20_thresh = round(world[(world["diff"] == year_min) & (world["requestYear"] == unique_year)]["povertyLine"].values[0], 2)
        p20_year_data = smy[(smy["PovertyLine"] == p20_thresh) & (smy["RequestYear"] == unique_year)].copy()
        p20_data_list.append(p20_year_data)

    p20_data = pd.concat(p20_data_list, ignore_index=True)
    p20_data.to_sql(name="PovCalNetP20", con=engine, schema="repo", index=False, if_exists="replace")
    engine.dispose()


if __name__ == '__main__':
    main()
