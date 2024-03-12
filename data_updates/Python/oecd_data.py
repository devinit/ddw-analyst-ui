
import datetime
import os
import pandas as pd
import sys
# from data_updates.utils import push_folder_to_github


current_date = datetime.datetime.now()
PURPOSE_CODE_TRENDS_URL = os.getenv('PURPOSE_CODE_TRENDS_URL', "https://ddw.devinit.org/api/export/1486/")
CSV_FILES_FOLDER = "data_updates/Python/oecd_csv"
CSV_FOLDER = "Python/oecd_csv"
DATA_REPO = "devinit/di-website-data"
REMOTE_BRANCH = "main"
REMOTE_FOLDER = f'{current_date.year}'
ODA_AID_TYPE_URL = os.getenv('ODA_AID_TYPE_URL', "https://ddw.devinit.org/api/export/1484/")
ODA_CHANNEL_TYPE_URL = os.getenv('ODA_CHANNEL_TYPE_URL', "https://ddw.devinit.org/api/export/1485/")
ODA_RECIP_TYPE_URL = os.getenv('ODA_RECIP_TYPE_URL', "https://ddw.devinit.org/api/export/1339/")

deflate_2021_to_2022_multiplier = pd.DataFrame.from_records([
    {"donor_name": "Australia", "multiplier":  0.986},
    {"donor_name": "Austria", "multiplier":  0.928},
    {"donor_name": "Belgium", "multiplier":  0.949},
    {"donor_name": "Canada", "multiplier":  1.043},
    {"donor_name": "Czechia", "multiplier":  1.009},
    {"donor_name": "Denmark", "multiplier":  0.963},
    {"donor_name": "Estonia", "multiplier":  1.024},
    {"donor_name": "Finland", "multiplier":  0.943},
    {"donor_name": "France", "multiplier":  0.91},
    {"donor_name": "Germany", "multiplier":  0.94},
    {"donor_name": "Greece", "multiplier":  0.96},
    {"donor_name": "Hungary", "multiplier":  0.925},
    {"donor_name": "Iceland", "multiplier":  0.996},
    {"donor_name": "Ireland", "multiplier":  0.943},
    {"donor_name": "Italy", "multiplier":  0.918},
    {"donor_name": "Japan", "multiplier":  0.833},
    {"donor_name": "Korea", "multiplier":  0.905},
    {"donor_name": "Lithuania", "multiplier":  1.03},
    {"donor_name": "Luxembourg", "multiplier":  0.943},
    {"donor_name": "Netherlands", "multiplier":  0.941},
    {"donor_name": "New Zealand", "multiplier":  0.947},
    {"donor_name": "Norway", "multiplier":  1.079},
    {"donor_name": "Poland", "multiplier":  0.966},
    {"donor_name": "Portugal", "multiplier":  0.936},
    {"donor_name": "Slovak Republic", "multiplier":  0.954},
    {"donor_name": "Slovenia", "multiplier":  0.948},
    {"donor_name": "Spain", "multiplier":  0.916},
    {"donor_name": "Sweden", "multiplier":  0.902},
    {"donor_name": "Switzerland", "multiplier":  0.986},
    {"donor_name": "United Kingdom", "multiplier":  0.94},
    {"donor_name": "United States", "multiplier":  1.069},
    {"donor_name": "EU Institutions", "multiplier":  0.93},
    {"donor_name": "IMF (Concessional Trust Funds)", "multiplier":  0.966},
    {"donor_name": "African Development Bank", "multiplier":  0.966},
    {"donor_name": "African Development Fund", "multiplier":  0.966},
    {"donor_name": "Asian Development Bank", "multiplier":  0.966},
    {"donor_name": "Inter-American Development Bank", "multiplier":  0.966},
    {"donor_name": "Asian Infrastructure Investment Bank", "multiplier":  0.966},
    {"donor_name": "Central American Bank for Economic Integration", "multiplier":  0.966},
    {"donor_name": "Caribbean Development Bank", "multiplier":  0.966},
    {"donor_name": "Council of Europe Development Bank", "multiplier":  0.966},
    {"donor_name": "Islamic Development Bank", "multiplier":  0.966},
    {"donor_name": "North American Development Bank", "multiplier":  0.966},
    {"donor_name": "Central Emergency Response Fund", "multiplier":  0.966},
    {"donor_name": "COVID-19 Response and Recovery Multi-Partner Trust Fund", "multiplier":  0.966},
    {"donor_name": "Food and Agriculture Organisation", "multiplier":  0.966},
    {"donor_name": "IFAD", "multiplier":  0.966},
    {"donor_name": "International Atomic Energy Agency", "multiplier":  0.966},
    {"donor_name": "International Labour Organisation", "multiplier":  0.966},
    {"donor_name": "Joint Sustainable Development Goals Fund", "multiplier":  0.966},
    {"donor_name": "UN Capital Development Fund", "multiplier":  0.966},
    {"donor_name": "UN Institute for Disarmament Research", "multiplier":  0.966},
    {"donor_name": "UN Peacebuilding Fund", "multiplier":  0.966},
    {"donor_name": "UN Women", "multiplier":  0.966},
    {"donor_name": "UNAIDS", "multiplier":  0.966},
    {"donor_name": "UNDP", "multiplier":  0.966},
    {"donor_name": "UNFPA", "multiplier":  0.966},
    {"donor_name": "UNHCR", "multiplier":  0.966},
    {"donor_name": "UNICEF", "multiplier":  0.966},
    {"donor_name": "United Nations Conference on Trade and Development", "multiplier":  0.966},
    {"donor_name": "United Nations Industrial Development Organization", "multiplier":  0.966},
    {"donor_name": "UNRWA", "multiplier":  0.966},
    {"donor_name": "WFP", "multiplier":  0.966},
    {"donor_name": "WHO-Strategic Preparedness and Response Plan", "multiplier":  0.966},
    {"donor_name": "World Health Organisation", "multiplier":  0.966},
    {"donor_name": "World Tourism Organisation", "multiplier":  0.966},
    {"donor_name": "World Trade Organisation", "multiplier":  0.966},
    {"donor_name": "WTO - International Trade Centre", "multiplier":  0.966},
    {"donor_name": "International Development Association", "multiplier":  0.966},
    {"donor_name": "Adaptation Fund", "multiplier":  0.966},
    {"donor_name": "Arab Fund (AFESD)", "multiplier":  0.966},
    {"donor_name": "Asian Forest Cooperation Organisation", "multiplier":  0.966},
    {"donor_name": "Center of Excellence in Finance", "multiplier":  0.966},
    {"donor_name": "CGIAR", "multiplier":  0.966},
    {"donor_name": "Climate Investment Funds", "multiplier":  0.966},
    {"donor_name": "Global Alliance for Vaccines and Immunization", "multiplier":  0.966},
    {"donor_name": "Global Environment Facility", "multiplier":  0.966},
    {"donor_name": "Global Fund", "multiplier":  0.966},
    {"donor_name": "Global Green Growth Institute", "multiplier":  0.966},
    {"donor_name": "Green Climate Fund", "multiplier":  0.966},
    {"donor_name": "International Centre for Genetic Engineering and Biotechnology", "multiplier":  0.966},
    {"donor_name": "International Commission on Missing Persons", "multiplier":  0.966},
    {"donor_name": "Nordic Development Fund", "multiplier":  0.966},
    {"donor_name": "OPEC Fund for International Development", "multiplier":  0.966},
    {"donor_name": "OSCE", "multiplier":  0.966},
    {"donor_name": "World Organisation for Animal Health", "multiplier":  0.966},
    {"donor_name": "Development Bank of Latin America", "multiplier":  0.966},
    {"donor_name": "Arab Bank for Economic Development in Africa", "multiplier":  0.966},
    {"donor_name": "UNECE", "multiplier":  0.966},
    {"donor_name": "UNEP", "multiplier":  0.966},
    {"donor_name": "Azerbaijan", "multiplier":  0.966},
    {"donor_name": "Bulgaria", "multiplier":  0.966},
    {"donor_name": "Croatia", "multiplier":  0.966},
    {"donor_name": "Cyprus", "multiplier":  0.966},
    {"donor_name": "Israel", "multiplier":  1.003},
    {"donor_name": "Kazakhstan", "multiplier":  0.966},
    {"donor_name": "Kuwait", "multiplier":  0.966},
    {"donor_name": "Latvia", "multiplier":  1.005},
    {"donor_name": "Liechtenstein", "multiplier":  0.966},
    {"donor_name": "Malta", "multiplier":  0.966},
    {"donor_name": "Monaco", "multiplier":  0.91},
    {"donor_name": "Qatar", "multiplier":  0.966},
    {"donor_name": "Romania", "multiplier":  0.966},
    {"donor_name": "Saudi Arabia", "multiplier":  0.966},
    {"donor_name": "Chinese Taipei", "multiplier":  0.966},
    {"donor_name": "Thailand", "multiplier":  0.966},
    {"donor_name": "TÃ¼rkiye", "multiplier":  1.026},
    {"donor_name": "United Arab Emirates", "multiplier":  0.966},
    {"donor_name": "Russia", "multiplier":  0.966},
    {"donor_name": "Timor-Leste", "multiplier":  0.966},
    {"donor_name": "Arcadia Fund", "multiplier":  0.94},
    {"donor_name": "Arcus Foundation", "multiplier":  1.069},
    {"donor_name": "Bernard van Leer Foundation", "multiplier":  0.941},
    {"donor_name": "Bezos Earth Fund", "multiplier":  1.069},
    {"donor_name": "Bill & Melinda Gates Foundation", "multiplier":  1.069},
    {"donor_name": "Bloomberg Family Foundation", "multiplier":  1.069},
    {"donor_name": "Carnegie Corporation of New York", "multiplier":  1.069},
    {"donor_name": "Charity Projects Ltd (Comic Relief)", "multiplier":  1.069},
    {"donor_name": "Children's Investment Fund Foundation", "multiplier":  0.94},
    {"donor_name": "Citi Foundation", "multiplier":  1.069},
    {"donor_name": "Conrad N. Hilton Foundation", "multiplier":  1.069},
    {"donor_name": "David and Lucile Packard Foundation", "multiplier":  1.069},
    {"donor_name": "Fondation Botnar", "multiplier":  0.986},
    {"donor_name": "Ford Foundation", "multiplier":  1.069},
    {"donor_name": "Gordon and Betty Moore Foundation", "multiplier":  1.069},
    {"donor_name": "H&M Foundation", "multiplier":  0.902},
    {"donor_name": "Howard G. Buffett Foundation", "multiplier":  1.069},
    {"donor_name": "IKEA Foundation", "multiplier":  0.941},
    {"donor_name": "Jacobs Foundation", "multiplier":  0.986},
    {"donor_name": "John D. and Catherine T. MacArthur Foundation", "multiplier":  1.069},
    {"donor_name": "La Caixa Banking Foundation", "multiplier":  0.916},
    {"donor_name": "Laudes Foundation", "multiplier":  0.986},
    {"donor_name": "LEGO Foundation", "multiplier":  0.963},
    {"donor_name": "Leona M. and Harry B. Helmsley Charitable Trust", "multiplier":  1.069},
    {"donor_name": "Margaret A. Cargill Foundation", "multiplier":  1.069},
    {"donor_name": "Mastercard Foundation", "multiplier":  1.043},
    {"donor_name": "MAVA Foundation", "multiplier":  0.986},
    {"donor_name": "Michael & Susan Dell Foundation", "multiplier":  1.069},
    {"donor_name": "Oak Foundation", "multiplier":  0.986},
    {"donor_name": "Omidyar Network Fund, Inc.", "multiplier":  1.069},
    {"donor_name": "Open Society Foundations", "multiplier":  1.069},
    {"donor_name": "Rockefeller Foundation", "multiplier":  1.069},
    {"donor_name": "Susan T. Buffett Foundation", "multiplier":  1.069},
    {"donor_name": "UBS Optimus Foundation", "multiplier":  0.986},
    {"donor_name": "Wellcome Trust", "multiplier":  0.94},
    {"donor_name": "William and Flora Hewlett Foundation", "multiplier":  1.069},
    {"donor_name": "World Diabetes Foundation", "multiplier":  0.963},
    {"donor_name": "Dutch Postcode Lottery", "multiplier":  0.941},
    {"donor_name": "German Postcode Lottery", "multiplier":  0.94},
    {"donor_name": "Norwegian Postcode Lottery", "multiplier":  1.079},
    {"donor_name": "People's Postcode Lottery", "multiplier":  0.94},
    {"donor_name": "Swedish Postcode Lottery", "multiplier":  0.902},
    {"donor_name": "International Bank for Reconstruction and Development", "multiplier":  0.966},
])

# create csv folder if it does not exist
path = 'data_updates/Python/oecd_csv'
isdir = os.path.isdir(path)
if not isdir:
    os.mkdir(f'{CSV_FILES_FOLDER}')

# OECD purpose code trends data

print("Starting read-in: Purpose")

purpose_code_data = pd.read_csv(PURPOSE_CODE_TRENDS_URL)
purpose_code_data = pd.DataFrame(purpose_code_data)
purpose_code_data.columns = ["year","donor_name","purpose_code","purpose_name","donor_type","usd_disbursement_deflated_Sum"]
purpose_code_data = purpose_code_data.merge(deflate_2021_to_2022_multiplier, how="left", on="donor_name")
purpose_code_data["usd_disbursement_deflated_Sum"] = purpose_code_data.usd_disbursement_deflated_Sum * purpose_code_data.multiplier
purpose_code_data = purpose_code_data.drop("multiplier", axis=1)

purpose_code_data2 = purpose_code_data.groupby(["year","purpose_code","purpose_name","donor_type"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()

purpose_code_data2.columns = ["year","purpose_code","purpose_name","donor_name","usd_disbursement_deflated_Sum"]
purpose_code_data2['donor_name'] = purpose_code_data2['donor_name'].replace(['DAC'],['DAC donors (total)'])
purpose_code_data2['donor_name'] = purpose_code_data2['donor_name'].replace(['Non-DAC'],['Non-DAC donors (total)'])
purpose_code_data2['donor_name'] = purpose_code_data2['donor_name'].replace(['Multilateral'],['Multilateral donors (total)'])

purpose_code_data3 = purpose_code_data2.groupby(["year","purpose_code","purpose_name"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()
purpose_code_data3['donor_name'] = 'All donors (total)'

purpose_code_data = purpose_code_data.drop(['donor_type'],axis=1)
purpose_code_data = pd.concat([purpose_code_data, purpose_code_data2]).reset_index(drop=True)
purpose_code_data = pd.concat([purpose_code_data, purpose_code_data3]).reset_index(drop=True)

purpose_code_data.to_csv(f'{CSV_FILES_FOLDER}/RH_and_FP_Purpose_code_trends_chart_OECD.csv', encoding='utf-8', index=False)

# RH FP aid type OECD

print("Starting read-in: Aid type")

aid_type_data = pd.read_csv(ODA_AID_TYPE_URL)
aid_type_data = pd.DataFrame(aid_type_data)
aid_type_data.columns = ["donor_name","aid_type_di_name","year","purpose_name","purpose_code","usd_disbursement_deflated_Sum","donor_type"]
aid_type_data = aid_type_data.merge(deflate_2021_to_2022_multiplier, how="left", on="donor_name")
aid_type_data["usd_disbursement_deflated_Sum"] = aid_type_data.usd_disbursement_deflated_Sum * aid_type_data.multiplier
aid_type_data = aid_type_data.drop("multiplier", axis=1)

aid_type_data2 = aid_type_data.groupby(["year","purpose_code","purpose_name","aid_type_di_name","donor_type"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()

aid_type_data2.columns = ["year","purpose_code","purpose_name","aid_type_di_name","donor_name","usd_disbursement_deflated_Sum"]
aid_type_data2['donor_name'] = aid_type_data2['donor_name'].replace(['DAC'],['DAC donors (total)'])
aid_type_data2['donor_name'] = aid_type_data2['donor_name'].replace(['Non-DAC'],['Non-DAC donors (total)'])
aid_type_data2['donor_name'] = aid_type_data2['donor_name'].replace(['Multilateral'],['Multilateral donors (total)'])

aid_type_data3 = aid_type_data2.groupby(["year","purpose_code","purpose_name","aid_type_di_name"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()
aid_type_data3['donor_name'] = 'All donors (total)'

aid_type_data = aid_type_data.drop(['donor_type'],axis=1)
aid_type_data = pd.concat([aid_type_data, aid_type_data2]).reset_index(drop=True)
aid_type_data = pd.concat([aid_type_data, aid_type_data3]).reset_index(drop=True)

aid_type_data.to_csv(f'{CSV_FILES_FOLDER}/RH_FP_aid_type_OECD.csv', encoding='utf-8', index=False)

# RH FP channels OECD

print("Starting read-in: Channels")

channels_data = pd.read_csv(ODA_CHANNEL_TYPE_URL)
channels_data = pd.DataFrame(channels_data)
channels_data.columns = ["year","donor_name","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","donor_type","usd_disbursement_deflated_Sum"]
channels_data = channels_data.merge(deflate_2021_to_2022_multiplier, how="left", on="donor_name")
channels_data["usd_disbursement_deflated_Sum"] = channels_data.usd_disbursement_deflated_Sum * channels_data.multiplier
channels_data = channels_data.drop("multiplier", axis=1)

channels_data['oecd_channel_parent_name'].fillna('Unspecified', inplace=True)
channels_data['oecd_aggregated_channel'].fillna('Unspecified', inplace=True)

channels_data['oecd_channel_parent_name'] = channels_data['oecd_channel_parent_name'].replace(['United Nations Agency, Fund Or Commission (UN)'],['United Nations agency, fund or commission (UN)'])

channels_data = channels_data.groupby(["year","donor_name","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","donor_type"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()

channels_data2 = channels_data.groupby(["year","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","donor_type"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()

channels_data2.columns = ["year","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","donor_name","usd_disbursement_deflated_Sum"]
channels_data2['donor_name'] = channels_data2['donor_name'].replace(['DAC'],['DAC donors (total)'])
channels_data2['donor_name'] = channels_data2['donor_name'].replace(['Non-DAC'],['Non-DAC donors (total)'])
channels_data2['donor_name'] = channels_data2['donor_name'].replace(['Multilateral'],['Multilateral donors (total)'])

channels_data3 = channels_data2.groupby(["year","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel"]).agg({"usd_disbursement_deflated_Sum":"sum"}).reset_index()
channels_data3['donor_name'] = 'All donors (total)'

channels_data = channels_data.drop(['donor_type'],axis=1)
channels_data = pd.concat([channels_data, channels_data2]).reset_index(drop=True)
channels_data = pd.concat([channels_data, channels_data3]).reset_index(drop=True)

channels_data.to_csv(f'{CSV_FILES_FOLDER}/RH_FP_channels_OECD.csv', encoding='utf-8', index=False)

# donor-by-recip-2019.csv

print("Starting read-in: Recipient")

recip_data = pd.read_csv(ODA_RECIP_TYPE_URL)
recip_data = pd.DataFrame(recip_data)
deflate_2021_to_2022_multiplier = deflate_2021_to_2022_multiplier.rename(columns={"donor_name": "Donor Name"})
recip_data = recip_data.merge(deflate_2021_to_2022_multiplier, how="left", on="Donor Name")
recip_data["USD Disbursement Deflated"] = recip_data["USD Disbursement Deflated"] * recip_data.multiplier
recip_data = recip_data.drop("multiplier", axis=1)

recip_data = recip_data[recip_data['Purpose Name'].isin(['Reproductive health care','Family planning'])]

recip_data['Recipient Name'] = recip_data['Recipient Name'].replace(['Bilateral, unspecified'],['Unspecified'])

recip_data1 = recip_data.groupby(["Donor Name","Purpose Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()

recip_data2 = recip_data.groupby(["donor_type","Purpose Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()

recip_data2.columns = ["Donor Name","Purpose Name","Recipient Name","Year","USD Disbursement Deflated"]
recip_data2['Donor Name'] = recip_data2['Donor Name'].replace(['DAC'],['DAC donors (total)'])
recip_data2['Donor Name'] = recip_data2['Donor Name'].replace(['Non-DAC'],['Non-DAC donors (total)'])
recip_data2['Donor Name'] = recip_data2['Donor Name'].replace(['Multilateral'],['Multilateral donors (total)'])

recip_data3 = recip_data2.groupby(["Purpose Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()
recip_data3['Donor Name'] = 'All donors (total)'

recip_data = pd.concat([recip_data1, recip_data2]).reset_index(drop=True)
recip_data = pd.concat([recip_data, recip_data3]).reset_index(drop=True)

# Summing both and joining

total_data = recip_data.groupby(["Donor Name","Recipient Name","Year"]).agg({"USD Disbursement Deflated":"sum"}).reset_index()
total_data['Purpose Name'] = "Reproductive health care and family planning"

recip_data = recip_data.append(pd.DataFrame(data = total_data),ignore_index=True)

max_year = recip_data["Year"].max()

recip_data = recip_data.pivot_table(index=['Donor Name', 'Purpose Name','Recipient Name'], columns='Year', values='USD Disbursement Deflated').reset_index()

cols_to_check = list(range(max_year-4,max_year+1))

recip_data[cols_to_check] = recip_data[cols_to_check].fillna(0)

recip_data["Removal"] = [True]*len(recip_data.index)

for col in cols_to_check:
    recip_data.loc[recip_data[col]!=0,"Removal"] = False

recip_data = recip_data[recip_data["Removal"]==False]

recip_data = recip_data[['Donor Name','Purpose Name','Recipient Name',2018,2019,2020,2021,2022]]

recipient_data = []

for donor in list(set(recip_data["Donor Name"])):
    for purpose in list(set(recip_data["Purpose Name"])):
        subset = recip_data[(recip_data["Donor Name"]==donor) & (recip_data["Purpose Name"]==purpose)].reset_index()
        subset = subset.sort_values(by=[2022,2021,2020,2019,2018,"Recipient Name"],ascending = [False,False,False,False,False,True]).reset_index()
        subset["Rank"] = subset.index + 1 # rank by years
        recipient_data.append(subset)

recipient_data = pd.concat(recipient_data)

recipient_data.columns = ["remove","index","donor_name","Code type","recipient_name",2018,2019,2020,2021,2022"rank"]

recipient_data = recipient_data[["donor_name","Code type","recipient_name",2018,2019,2020,2021,2022"rank"]]

recipient_data.to_csv(f'{CSV_FILES_FOLDER}/donor_by_recip_2019.csv', encoding='utf-8', index=False)

# Push csv folder to github
push_folder_to_github(DATA_REPO, REMOTE_BRANCH, CSV_FOLDER, REMOTE_FOLDER, 'Committing from API', '*.csv')
