import os
import requests
import glob
from requests.auth import HTTPBasicAuth
import pandas as pd
from github import Github, InputGitTreeElement
from django.conf import settings


GITHUB_KEY = 'you_can_put_your_github_token_here_for_testing'

def push_folder_to_github(repo_name, branch, local_folder, remote_folder, commit_msg, file_extension='*.*'):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    glob_path = os.path.join(dir_path, local_folder, file_extension)
    csv_paths = glob.glob(glob_path)
    abs_csv_paths = [os.path.abspath(csv) for csv in csv_paths]
    if len(abs_csv_paths) < 1:
        print('Nothing to push')
        return
    g = Github(settings.GITHUB_TOKEN)
    # Uncomment below line to use your token for testing. Make sure you do not push changes with your token to Github
    # g = Github(GITHUB_KEY)
    repo = g.get_repo(repo_name)
    git_ref = repo.get_git_ref('heads/' + branch)
    branch_obj = repo.get_branch(branch=branch)
    git_sha = branch_obj.commit.sha
    base_tree = repo.get_git_tree(git_sha)
    element_list = list()
    for abs_csv_path in abs_csv_paths:
        with open(abs_csv_path) as input_file:
            data = input_file.read()
        remote_file = remote_folder + '/' + os.path.basename(abs_csv_path)
        element = InputGitTreeElement(remote_file, '100644', 'blob', data)
        element_list.append(element)

    tree = repo.create_git_tree(element_list, base_tree)
    parent = repo.get_git_commit(git_sha)
    commit = repo.create_git_commit(commit_msg, tree, [parent])
    git_ref.edit(commit.sha)


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

# Sample call to the function below
# push_folder_to_github('wakibi/di-website-data', 'main', 'csv', '2022', 'Committing from API', '*.csv')
