import os
import glob
import pandas as pd
from github import Github, InputGitTreeElement
from django.conf import settings

PURPOSE_CODE_TRENDS_URL = "https://staging-ddw.devinit.org/api/export/1241/"
CSV_FOLDER = "oecd_csv"
DATA_REPO = "devinit/di-website-data"
REMOTE_BRANCH = "gates/oecd"
REMOTE_FOLDER = "2022"
ODA_AID_TYPE_URL = "https://staging-ddw.devinit.org/api/export/1238/"
ODA_CHANNEL_TYPE_URL = "https://staging-ddw.devinit.org/api/export/1237/"

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

# OECD purpose code trends data

print("Starting read-in")

purporse_code_data = pd.read_csv(PURPOSE_CODE_TRENDS_URL)
purporse_code_data = pd.DataFrame(purporse_code_data)
purporse_code_data.columns = ["year","donor_name","purpose_code","purpose_name","usd_disbursement_deflated_Sum"]

purporse_code_data.to_csv(f'{CSV_FOLDER}/RH and FP Purpose code trends chart OECD.csv', encoding='utf-8', index=False)

# RH FP aid type OECD

aid_type_data = pd.read_csv(ODA_AID_TYPE_URL)
aid_type_data = pd.DataFrame(aid_type_data)
aid_type_data.columns = ["donor_name","aid_type_di_name","year","purpose_name","purpose_code","usd_disbursement_deflated_Sum"]

aid_type_data.to_csv(f'{CSV_FOLDER}/RH FP aid type OECD.csv', encoding='utf-8', index=False)

# RH FP channels OECD

channels_data = pd.read_csv(ODA_CHANNEL_TYPE_URL)
channels_data = pd.DataFrame(channels_data)
channels_data.columns = ["year","donor_name","purpose_code","purpose_name","oecd_channel_parent_name","oecd_aggregated_channel","usd_disbursement_deflated_Sum"]

channels_data.to_csv(f'{CSV_FOLDER}/RH FP channels OECD.csv', encoding='utf-8', index=False)

# Push csv folder to github
push_folder_to_github(DATA_REPO, REMOTE_BRANCH, CSV_FOLDER, REMOTE_FOLDER, 'Committing from API', '*.csv')
