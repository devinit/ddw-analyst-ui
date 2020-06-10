import os
import glob
import subprocess


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
