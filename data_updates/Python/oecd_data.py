
import datetime
import os
import glob
import numpy
from numpy import NaN
import pandas as pd
from data_updates.utils import push_folder_to_github


current_date = datetime.datetime.now()
PURPOSE_CODE_TRENDS_URL = os.getenv('PURPOSE_CODE_TRENDS_URL', "https://staging-ddw.devinit.org/api/export/1241/")
CSV_FILES_FOLDER = "data_updates/Python/oecd_csv"
CSV_FOLDER = "oecd_csv"
DATA_REPO = "devinit/di-website-data"
REMOTE_BRANCH = "main"
REMOTE_FOLDER = f'{current_date.year}'
ODA_AID_TYPE_URL = os.getenv('ODA_AID_TYPE_URL', "https://staging-ddw.devinit.org/api/export/1238/")
ODA_CHANNEL_TYPE_URL = os.getenv('ODA_CHANNEL_TYPE_URL', "https://staging-ddw.devinit.org/api/export/1237/")
ODA_RECIP_TYPE_URL = os.getenv('ODA_RECIP_TYPE_URL', "https://ddw.devinit.org/api/export/1339/")


# create csv folder if it does not exist
path = 'data_updates/Python/oecd_csv'
isdir = os.path.isdir(path)
if not isdir:
    os.mkdir(f'{CSV_FILES_FOLDER}')

# OECD purpose code trends data

print("Starting read-in: Purpose")

purporse_code_data = pd.read_csv(PURPOSE_CODE_TRENDS_URL)
purporse_code_data = pd.DataFrame(purporse_code_data)
purporse_code_data.columns = ["year","donor_name","purpose_code","purpose_name","usd_disbursement_deflated_Sum"]

purporse_code_data.to_csv(f'{CSV_FILES_FOLDER}/RH_and_FP_Purpose_code_trends_chart_OECD.csv', encoding='utf-8', index=False)

# RH FP aid type OECD

print("Starting read-in: Aid type")

aid_type_data = pd.read_csv(ODA_AID_TYPE_URL)
aid_type_data = pd.DataFrame(aid_type_data)
aid_type_data.columns = ["donor_name","aid_type_di_name","year","purpose_name","purpose_code","usd_disbursement_deflated_Sum"]

aid_type_data.to_csv(f'{CSV_FILES_FOLDER}/RH_FP_aid_type_OECD.csv', encoding='utf-8', index=False)

# RH FP channels OECD

print("Starting read-in: Channels")

channels_data = pd.read_csv(ODA_CHANNEL_TYPE_URL)
channels_data = pd.DataFrame(channels_data)
channels_data.columns = ["year","donor_name","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","usd_disbursement_deflated_Sum"]

channels_data.to_csv(f'{CSV_FILES_FOLDER}/RH_FP_channels_OECD.csv', encoding='utf-8', index=False)

# donor-by-recip-2019.csv

print("Starting read-in: Recipient")

recip_data = pd.read_csv(ODA_RECIP_TYPE_URL)
recip_data = pd.DataFrame(recip_data)

recip_data = recip_data[recip_data['Purpose Name'].isin(['Reproductive health care','Family planning'])]

recip_data['Recipient Name'] = recip_data['Recipient Name'].replace(['Bilateral, unspecified'],['Unspecified'])

recip_data = recip_data.groupby(["Donor Name","Purpose Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()

# Summing both and joining

total_data = recip_data.groupby(["Donor Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()
total_data['Purpose Name'] = "Reproductive health care and family planning"

recip_data = recip_data.append(pd.DataFrame(data = total_data),ignore_index=True)

recip_data = recip_data.pivot_table(index=['Donor Name', 'Purpose Name','Recipient Name'], columns='Year', values='USD Disbursement Deflated').reset_index()

cols_to_check = [2016,2017,2018,2019]

recip_data[cols_to_check] = recip_data[cols_to_check].fillna(0)

recip_data["Removal"] = (recip_data[2016]==0) & (recip_data[2017]==0) & (recip_data[2018]==0) & (recip_data[2019]==0)

recip_data = recip_data[recip_data["Removal"]==False]

recip_data = recip_data[['Donor Name','Purpose Name','Recipient Name',2016,2017,2018,2019]]

recipient_data = []

for donor in list(set(recip_data["Donor Name"])):
    for purpose in list(set(recip_data["Purpose Name"])):
        subset = recip_data[(recip_data["Donor Name"]==donor) & (recip_data["Purpose Name"]==purpose)].reset_index()
        subset = subset.sort_values(by=[2019,2018,2017,2016,"Recipient Name"],ascending = [False,False,False,False,True]).reset_index()
        subset["Rank"] = subset.index + 1 # rank by years
        recipient_data.append(subset)

recipient_data = pd.concat(recipient_data)

recipient_data.columns = ["remove","index","donor_name","Code type","recipient_name",2016,2017,2018,2019,"rank"]

recipient_data = recipient_data[["donor_name","Code type","recipient_name",2016,2017,2018,2019,"rank"]]

recipient_data.to_csv(f'{CSV_FILES_FOLDER}/donor_by_recip_2019.csv', encoding='utf-8', index=False)

# Push csv folder to github
push_folder_to_github(DATA_REPO, REMOTE_BRANCH, CSV_FOLDER, REMOTE_FOLDER, 'Committing from API', '*.csv')
