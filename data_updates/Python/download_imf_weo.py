#!/usr/bin/env python3

import os
import time
import urllib.request
from bs4 import BeautifulSoup
from progress_hook import  reporthook

# Get the current date.
download_date = time.strftime("%Y_%m_%d")

# Save file as.
#destination = str(download_date) + "_" + "WDI_csv.zip"

# Save file in.
current_directory = os.getcwd()

# Create a folder in the current directory named with the download date.
content_directory = "imf_weo_"+download_date
print("Creating directory " + content_directory + " in:\t " + current_directory)
print("...")
print("")

# Do this only if the directory does not already exists so as not to override the data.
if not os.path.exists(content_directory):
    os.mkdir(content_directory)
else:
    print("The directory " + content_directory + " already exists")
    print("Check the folder to make sure you are not deleting existing data")
    exit()

# Change into to recently created directory.
os.chdir(content_directory)

# Try to get the file(s) or bail out.
# Cannot handle exceptions very well at the moment, so won't be "try"in and "except"ioning.

# This does not work in Python3
# urllib.URLopener is the base class for opening and reading URLs.
#fh = urllib.URLopener()
#print("Establishing connection...")
#print("")
# Retrieve the contents of URL and place it in the specified filename.
#fh.retrieve(source, current_directory + "/" + destination)

# Download file from 'source'
# Download file 'source_file'

# The for loops below recreate the URIs in the form:
# http://www.imf.org/external/pubs/ft/weo/2015/02/weodata/WEOOct2015all.xls
# http://www.imf.org/external/pubs/ft/weo/
# 2015/
# 02/
# weodata/
# WEO
# Oct
# 2015
# all
# .xls

# 2011, 2nd release is in September, not October
# http://www.imf.org/external/pubs/ft/weo/2011/02/weodata/WEOSep2011all.xls
# http://www.imf.org/external/pubs/ft/weo/2011/02/weodata/WEOSep2011alla.xls

years = range(2007, 2017, 1)
#release_versions = ['01', '02']
#months = ['Apr', 'Sep', 'Oct']
release_versions = {'01': 'Apr', '02': 'Oct'}
data_sets = ['all', 'alla']

for year in years:
    #print(year)
    for release_version, month in release_versions.items():
        #print(year, release_version)
        for data_set in data_sets:
            if (year == 2007) and (release_version == '01'): # weodata = data in the URI
                #print(year, release_version, 'Sep', data_set)
                source = 'http://www.imf.org/external/pubs/ft/weo/' + \
                str(year) + \
                '/' + \
                release_version + \
                '/' + \
                'data/WEO' + \
                month + \
                str(year) + \
                data_set + \
                '.xls'
                #print(source)
                source_file = source.split("/")[-1]
                #print(source_file)

                # This solution came from:
                # http://stackoverflow.com/questions/7243750/download-file-from-web-in-python-3
                # Download the file from 'source' and save it locally under 'current_directory + "/" + destination':
                urllib.request.urlretrieve(source, source_file)

                # Print download details to the screen for the user.
                print("")
                print("Downloading from:\t\t\t\t" + source)
                print("Downloading file:\t\t\t\t" + source_file)
                print("Downloading to:\t\t\t\t\t" + current_directory + "/" + download_date)
                print("Saving as:\t\t\t\t\t" + source_file)

            elif (year == 2011) and (release_version == '02'): # Second release in September, not October as for all other
                #print(year, release_version, 'Sep', data_set)
                source = 'http://www.imf.org/external/pubs/ft/weo/' + \
                str(year) + \
                '/' + \
                release_version + \
                '/' + \
                'weodata/WEO' + \
                'Sep' + \
                str(year) + \
                data_set + \
                '.xls'
                #print(source)
                source_file = source.split("/")[-1]
                #print(source_file)

                # This solution came from:
                # http://stackoverflow.com/questions/7243750/download-file-from-web-in-python-3
                # Download the file from 'source' and save it locally under 'current_directory + "/" + destination':
                urllib.request.urlretrieve(source, source_file)

                # Print download details to the screen for the user.
                print("")
                print("Downloading from:\t\t\t\t" + source)
                print("Downloading file:\t\t\t\t" + source_file)
                print("Downloading to:\t\t\t\t\t" + current_directory + "/" + download_date)
                print("Saving as:\t\t\t\t\t" + source_file)

            else: # All other URIs follow the same pattern
                #print(year, release_version, month, data_set)
                source = 'http://www.imf.org/external/pubs/ft/weo/' + \
                str(year) + \
                '/' + \
                release_version + \
                '/' + \
                'weodata/WEO' + \
                month + \
                str(year) + \
                data_set + \
                '.xls'
                #print(source)
                source_file = source.split("/")[-1]
                #print(source_file)

                # This solution came from:
                # http://stackoverflow.com/questions/7243750/download-file-from-web-in-python-3
                # Download the file from 'source' and save it locally under 'current_directory + "/" + destination':
                urllib.request.urlretrieve(source, source_file)

                # Print download details to the screen for the user.
                print("")
                print("Downloading from:\t\t\t\t" + source)
                print("Downloading file:\t\t\t\t" + source_file)
                print("Downloading to:\t\t\t\t\t" + current_directory + "/" + download_date)
                print("Saving as:\t\t\t\t\t" + source_file)

# Finished!
print("Finished.")

# Change back into the current directory.
os.chdir(current_directory)
print("In directory:\t\t\t\t\t", current_directory)
