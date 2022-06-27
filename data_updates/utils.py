import os
import glob
import subprocess
from github import Github, InputGitTreeElement


GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', None)


def list_update_scripts():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    glob_path = os.path.join(dir_path, "*.sh")
    sh_paths = glob.glob(glob_path)
    sh_utils = ["indexing.sh", "manual_data.sh", "remove_null.sh", "completed_scripts.sh"]
    return [os.path.basename(sh_path) for sh_path in sh_paths if os.path.basename(sh_path) not in sh_utils]


class ScriptExecutor:
    """Sets up generator for streaming script output"""
    def __init__(self, script_name):
        if script_name in list_update_scripts():
            dir_path = os.path.dirname(os.path.realpath(__file__))
            script_path = os.path.join(dir_path, script_name)
            self.process = subprocess.Popen([script_path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        else:
            raise FileNotFoundError

    def stream(self):
        # Poll process for new output until finished
        while self.process.poll() is not None:
            yield self.process.stdout.readline()

        yield self.process.communicate()
        yield self.process.returncode

def push_folder_to_github(repo_name, branch, local_folder, remote_folder, commit_msg, file_extension='*.*'):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    glob_path = os.path.join(dir_path, local_folder, file_extension)
    csv_paths = glob.glob(glob_path)
    abs_csv_paths = [os.path.abspath(csv) for csv in csv_paths]
    if len(abs_csv_paths) < 1:
        print('Nothing to push')
        return
    g = Github(GITHUB_TOKEN)
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
