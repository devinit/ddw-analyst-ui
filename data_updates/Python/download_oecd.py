#!/usr/bin/env python3

import os
import time
import requests
from bs4 import BeautifulSoup
import constants
import sys
import getopt
import shutil
import zipfile
import subprocess


def main(argv):
    def printhelp():
        print('download_oecd.py -t <tablename>\nHelp: download_oecd.py --help\-h')
        sys.exit(2)

    try:
        opts, args = getopt.getopt(argv, "ht:", ["help", "table="])
        if not opts:
            printhelp()

    except getopt.GetoptError:
        printhelp()

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print('Usage:\tdownload_oecd.py -t <tablename>\n')
            print('Options:\n')
            print('\t-t, --table\tName of table to download from')
            print('Table Options:\n')
            print('\tTABLE1\t oecd dac_table1 download')
            print('\tTABLE2A\t oecd dac_table2a download')
            print('\tTABLE2B\t oecd dac_table2b download')
            print('\tCRS1\t oecd crs download')
            sys.exit()
        elif opt in ("-t", "--table"):
            if arg not in constants.OECD_DOWNLOADABLE:
                printhelp()
            elif arg == 'TABLE1':
                print("Downloading table 1")
                download(constants.TABLE1_SCRAPE_PATH, constants.OECD_DOWNLOAD_PATH, 'Table1_')
            elif arg == 'TABLE2A':
                print('Downloading table 2a')
                download(constants.TABLE2A_SCRAPE_PATH, constants.OECD_DOWNLOAD_PATH, 'Table2a_')
            elif arg == 'TABLE2B':
                print('Downloading table 2b')
                download(constants.TABLE2B_SCRAPE_PATH, constants.OECD_DOWNLOAD_PATH, 'Table2b_')
            elif arg == "CRS":
                print('Download table CRS1')
                download(constants.CRS_SCRAPE_PATH, constants.OECD_DOWNLOAD_PATH, 'Crs_')
            elif arg == "TABLE5":
                print('Download table Table5')
                download(constants.TABLE5_SCRAPE_PATH, constants.OECD_DOWNLOAD_PATH, 'Table5_')
            else:
                printhelp()

def download(scrape_path, download_path, output_folder_prefix):

    html = requests.get(scrape_path).content

    soup = BeautifulSoup(html, 'lxml')

    anchor_tags = soup('a')

    files_to_download = {}
    for tag in anchor_tags:

        # Save the name of the file and the file id in a dictionary.
        files_to_download[tag.text.split("/")[0]] = tag['onclick'][15:-3]
        # print(files_to_download)

    # 3) Download the files!

    # Define the root of the URI of the file that you want to download.
    uri_root = download_path

    # https://stats.oecd.org/FileView2.aspx?IDFile=b64f050c-4e2f-44ed-a8e6-db32ce00fd4f

    # Store the date on which the download was made in a string.
    download_date = time.strftime("%Y_%m_%d_%H_%M_%S")

    # Create a folder in the current directory named with the download date.
    content_directory = os.path.join(constants.TMP_DOWNLOAD_PATH, output_folder_prefix+"latest")
    timestamp_file = os.path.join(content_directory, ".timestamp")
    print("Creating directory " + content_directory + " in:\t " + constants.TMP_DOWNLOAD_PATH)
    print("...")
    print("")

    # Do this only if the directory does not already exists so as not to override the data.
    if not os.path.exists(content_directory):
        os.mkdir(content_directory)
        with open(timestamp_file, "w") as ts_f:
            ts_f.write(download_date)
    else:
        # Move `_latest` to timestamped folder
        with open(timestamp_file, "r") as ts_f:
            past_date = ts_f.read()
        timestamped_directory = os.path.join(constants.TMP_DOWNLOAD_PATH, output_folder_prefix+past_date)
        print("The directory " + content_directory + " already exists")
        print("Moving to " + timestamped_directory)
        shutil.copytree(content_directory, timestamped_directory)
        shutil.rmtree(content_directory)
        os.mkdir(content_directory)
        with open(timestamp_file, "w") as ts_f:
            ts_f.write(download_date)

    # Sort the keys (file names) of the dictionary so that you download the files in order.
    to_get = list(files_to_download.keys())
    to_get.sort()

    # Download the files in order.
    for file_to_get in to_get:

        # Replace the "_" in the file ids with "-".
        uri_suffix = files_to_download[file_to_get].replace("_", "-")

        # Define the full URI.
        uri = uri_root + uri_suffix

        # Define the name of the target file.
        name = str(file_to_get).strip() + ".zip"
        name = name.replace(" ", "_")
        name = name.replace("-", "_")

        # Display download information for the user.
        print("Downloading OECD file:\t\t\t", file_to_get)
        print("Downloading from:\t\t\t", uri)
        print("Saving data as:\t\t\t\t", name)
        print("...")
        print("")

        r = requests.get(uri, stream=True)
        path = os.path.join(content_directory, name)
        with open(path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    f.flush()

        # Unzip
        dir_path = os.path.dirname(os.path.realpath(__file__))
        remove_null_script_path = os.path.abspath(os.path.join(dir_path, "..", "remove_null.sh"))
        with zipfile.ZipFile(path, "r") as zip_ref:
            zip_ref.extractall(content_directory)
            extracted_files = zip_ref.namelist()
            for extracted_file in extracted_files:
                full_path_extracted_file = os.path.join(content_directory, extracted_file)
                rm_null_cmd = [remove_null_script_path, full_path_extracted_file]
                subprocess.run(rm_null_cmd)

    # Finished!
    print("Finished.\t\t\t")


if __name__ == "__main__":
    main(sys.argv[1:])
