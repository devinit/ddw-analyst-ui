import os
import requests
import glob
from requests.auth import HTTPBasicAuth
import pandas as pd
from utils.data_updates import push_folder_to_github

try:
    os.mkdir("iati_csv")
except:
    print("Folder already exists!")

donors_selected = pd.read_csv("https://ddw.devinit.org/api/export/1447")

donors_selected.columns = ["reporting_org_ref","registry_id","org_type","org_name","abbreviation","usability_score","tracker_commit","tracker_spend","latest_txn_year","hq_country","CRS_codes","IATI_organisation_type","IATI_organisation_name","country"]

donors_selected = donors_selected[donors_selected['tracker_spend'] == "Yes"]

donors_selected = donors_selected[['reporting_org_ref','country']]


# Dataset 1

data = pd.read_csv("https://ddw.devinit.org/api/export/1231")

data = pd.DataFrame(data)

data.columns = ["Reporting Organisation Reference","Reporting Organisation Narrative","year","Sector Code - Calculated"
, "DAC3 Sector Code - Calculated","Reporting Organisation Type Code","Reporting Organisation Type Name - Calculated"
,"Recipient Code","Recipient Name","Flow Type Code - Calculated","aid_type_di_name","x_transaction_value_usd_m_Sum"]

data = data[data['Reporting Organisation Reference'].isin(donors_selected['reporting_org_ref'])]

data = data[(data['Sector Code - Calculated'] != 13010) & (data['Sector Code - Calculated'] != 13081)]

data = pd.merge(data, donors_selected, left_on='Reporting Organisation Reference',right_on='reporting_org_ref').drop('reporting_org_ref', axis=1)

data = data.groupby(["year","country","Sector Code - Calculated"
, "DAC3 Sector Code - Calculated","Reporting Organisation Type Code","Reporting Organisation Type Name - Calculated"
,"Recipient Code","Recipient Name","Flow Type Code - Calculated","aid_type_di_name"],dropna=False).sum().reset_index()

# Sector code mapping

data['purpose_name'] = ""

data.loc[data['Sector Code - Calculated']==13020,'purpose_name'] = "Reproductive health care"
data.loc[data['Sector Code - Calculated']==13030,'purpose_name'] = "Family planning"

# Only ODA

data = data[data['Flow Type Code - Calculated'] ==10]

# Put it in millions

data["x_transaction_value_usd_m_Sum"] = data["x_transaction_value_usd_m_Sum"]/1000000

# Rename away from country

data["Reporting Organisation Narrative"] = data["country"]

data = data[data['country'] != "Germany"]

data.to_csv("iati_csv/IATI-RHFP-data-v1.csv", encoding='utf-8', index=False)

# Dataset 2

data = pd.read_csv("https://ddw.devinit.org/api/export/1271")

data = data[data['Reporting Organsation Reference'].isin(donors_selected['reporting_org_ref'])]

data = pd.DataFrame(data)

data.columns = ["Code type","Year", "recipient_name","Reporting Organisation Narrative","Reporting Organisation Reference","Flow Type Code - Calculated","disbursed"]

data = data[(data['Code type'] != 13010) & (data['Code type'] != 13081)]

# Sector code mapping

data.loc[data['Code type']==13020,'Code type'] = "Reproductive health care"
data.loc[data['Code type']==13030,'Code type'] = "Family planning"

# Only ODA

data = data[data['Flow Type Code - Calculated'] ==10]

data = pd.merge(data, donors_selected, left_on='Reporting Organisation Reference',right_on='reporting_org_ref').drop('reporting_org_ref', axis=1)

# Summing both

total_data = data.groupby(["Year","recipient_name","country"]).agg({"disbursed":"sum"}).reset_index()
total_data['Code type'] = "Reproductive health care and family planning"

# Groupby country

data = data.groupby(["Year","recipient_name","country","Code type"]).agg({"disbursed":"sum"}).reset_index()

data = data.append(pd.DataFrame(data = total_data),ignore_index=True)

# Put it in millions

data["disbursed"] = data["disbursed"]/1000000

data = data.pivot(index=['Code type','country','recipient_name'], columns='Year', values='disbursed').reset_index()

data["Reporting Organisation Narrative"] = data["country"]

data = data[data['country'] != "Germany"]

data.to_csv("iati_csv/IATI-RHFP-data-v2.csv", encoding='utf-8', index=False)

# Dataset 4

data = pd.read_csv("https://ddw.devinit.org/api/export/1309")

data = pd.DataFrame(data)

data.columns = ["Donor Name","Aid Type Di Name", "Year","Purpose Code","Reporting Organisation Reference", "Usd Disbursement Deflated Sum"]

data = data[data["Reporting Organisation Reference"].isin(donors_selected['reporting_org_ref'])]

data = pd.merge(data, donors_selected, left_on='Reporting Organisation Reference',right_on='reporting_org_ref').drop('reporting_org_ref', axis=1)

data = data[(data['Purpose Code'] != 13010) & (data['Purpose Code'] != 13081)]

# Sector code mapping

data.loc[data['Purpose Code']==13020,'Purpose Name'] = "Reproductive health care"
data.loc[data['Purpose Code']==13030,'Purpose Name'] = "Family planning"

# Put it in millions

data["Usd Disbursement Deflated Sum"] = data["Usd Disbursement Deflated Sum"]/1000000

data = data.groupby(["Year","Aid Type Di Name","country","Purpose Name","Purpose Code"]).agg({"Usd Disbursement Deflated Sum":"sum"}).reset_index()

data["Donor Name"] = data["country"]

data = data[data['country'] != "Germany"]

data.to_csv("iati_csv/iati_rhfp4.csv", encoding='utf-8', index=False)

# Sample call to the function below
push_folder_to_github('devinit/di-website-data', 'main', 'iati_csv', '2022', 'Committing from API', '*.csv')
