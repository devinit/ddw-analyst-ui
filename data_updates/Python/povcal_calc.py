import pandas as pd
import pdb

agg = pd.read_csv("C:/Users/Alex/Documents/Data/pcn_auto2/agg.csv")
smy = pd.read_csv("C:/Users/Alex/Documents/Data/pcn_auto2/smy.csv")

world = agg[agg["RegionTitle"]=="World Total"].copy()

world["diff"] = abs(world["H"]-20)

p20_thresh = round(world[world["diff"]==min(world["diff"])]["PovertyLine"].values[0],2)

p20_data = smy[(smy["PovertyLine"]==p20_thresh) & (smy["displayMode"].isin([0,2,4])) & (smy["CoverageType"].isin([3,5]))]

ext_data = smy[(smy["PovertyLine"]==1.90) & (smy["displayMode"].isin([0,2,4])) & (smy["CoverageType"].isin([3,5]))]

p20_data.to_csv("C:/Users/Alex/Documents/Data/pcn_auto2/p20.csv",index=False)
ext_data.to_csv("C:/Users/Alex/Documents/Data/pcn_auto2/ext.csv",index=False)