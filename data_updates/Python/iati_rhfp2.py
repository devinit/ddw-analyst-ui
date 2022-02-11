import os
import requests
from requests.auth import HTTPBasicAuth
import pandas as pd


print("Starting read-in")

data = pd.read_csv("https://ddw.devinit.org/api/export/1271")

data = pd.DataFrame(data)

data.columns = ["Code type","Year", "recipient_name","Reporting Organisation Narrative", "disbursed"]

data = data[(data['Code type'] != 13010) & (data['Code type'] != 13081)]

# Sector code mapping

data.loc[data['Code type']==13020,'Code type'] = "Reproductive health care"
data.loc[data['Code type']==13030,'Code type'] = "Family planning"

# Summing both

total_data = data.groupby(["Year","recipient_name","Reporting Organisation Narrative"]).agg({"disbursed":"sum"}).reset_index()
total_data['Code type'] = "Reproductive health care and family planning"

data = data.append(pd.DataFrame(data = total_data),ignore_index=True)

# Put it in millions

data["disbursed"] = data["disbursed"]/1000000

data.to_csv("iati_rhfp2.csv", encoding='utf-8', index=False)