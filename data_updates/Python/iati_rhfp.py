import os
import requests
from requests.auth import HTTPBasicAuth
import pandas as pd


print("Starting read-in")

data = pd.read_csv("https://ddw.devinit.org/api/export/1231")

data = pd.DataFrame(data)

data.columns = ["year","Reporting Organisation Narrative","aid_type_di_name","Sector Code - Calculated"
, "DAC3 Sector Code - Calculated","Reporting Organisation Type Code","Reporting Organisation Type Name - Calculated"
,"Recipient Code","Recipient Name","Flow Type Code - Calculated","Transaction Receiver Organisation Type","Transaction Type","x_transaction_value_usd_m_Sum"]

data = data[(data['Sector Code - Calculated'] != 13010) & (data['Sector Code - Calculated'] != 13081)]

# Sector code mapping

data.loc[data['Sector Code - Calculated']==13020,'Sector Code - Calculated'] = "Reproductive health care"
data.loc[data['Sector Code - Calculated']==13030,'Sector Code - Calculated'] = "Family planning"

# Channel of delivery mapping

data.loc[data['Transaction Receiver Organisation Type'].isin([21,22,23,24]),'Transaction Receiver Organisation Type'] = "NGOs and Civil Society"
data.loc[data['Transaction Receiver Organisation Type'].isin([40]),'Transaction Receiver Organisation Type'] = "Multilateral"
data.loc[data['Transaction Receiver Organisation Type'].isin([10]),'Transaction Receiver Organisation Type'] = "Public Sector"
data.loc[data['Transaction Receiver Organisation Type'].isin([70,73]),'Transaction Receiver Organisation Type'] = "Private Sector"
data.loc[data['Transaction Receiver Organisation Type'].isin([80]),'Transaction Receiver Organisation Type'] = "Universities and Research Institutes"
data.loc[data['Transaction Receiver Organisation Type'].isin([90]),'Transaction Receiver Organisation Type'] = "Other"

# Put it in millions

data["x_transaction_value_usd_m_Sum"] = data["x_transaction_value_usd_m_Sum"]/1000000

data.to_csv("iati_rhfp.csv", encoding='utf-8', index=False)