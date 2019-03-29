#!/usr/bin/env python3

import os
import time
import urllib.request as RemoteCrs
from bs4 import BeautifulSoup
from progress_hook import  reporthook
import constants

# 1) Read the contents of the OECD "Bulk Download" web page.

# Supply the web page address.
print(constants.CRS_SCRAPE_PATH)
# Open the web page.
request = RemoteCrs.Request(constants.CRS_SCRAPE_PATH)
response = RemoteCrs.urlopen(request)
html = response.read()
# Possible error (but don't know how to handle exceptions at the moment):
# urllib.error.HTTPError: HTTP Error 503: Service Unavailable

# Read the data from the web page.
soup = BeautifulSoup(html,'lxml')

# 2) Retrieve all of the anchor tags from the source of the "Bulk Download" web page.

# In HTML, links are defined with the <a> tag, e.g.: <a href="url">link text</a>.
# We are looking for entries of the form:
# <a 
# onclick="return OpenFile82c8801d_641f_49ec_8ace_9e003224c3d1();" 
# onmouseover="this.style.color=&#39;#cc3333&#39;;" 
# onmouseout="this.style.color=&#39;#333399&#39;;" 
# target="_blank" title="Download Files: 
# Creditor Reporting System (CRS)" class="DownloadLinks">CRS 1973-94 / SNPC 1973-94
# </a>.

anchor_tags = soup('a')

# We are interested in the substring of the tag that contains:
# onclick="return OpenFile82c8801d_641f_49ec_8ace_9e003224c3d1();".

# A tag may have any number of attributes.
# For example, the tag <b class="boldest"> has an attribute "class" whose value is "boldest".
# You can access a tag's attributes by treating the tag like a dictionary i.e.: tag['class'].
# We are going to access the file ids that are buried in the anchor tags by looking at the 'onclick' attribute of the tag.

files_to_download = {}
for tag in anchor_tags:

    # Show the whole tag.
    #print("Tag:\t\t\t\t\t", tag)
    #print("")

    # Show ALL the attributes of the tag.
    #print("Tag attributes:\t\t\t\t", tag.attrs)
    #print("")

    # Show the title.
    #print("Title:\t\t\t\t\t", tag['title'])
    #print("")

    # Show the name of the file.
    # This information is the text between the opening and closing anchor tag <a>text</a>.
    #print("File name:\t\t\t\t", tag.text.split("/")[0])
    #print("")

    # Show the substring that we are interested in, i.e., the file id.
    # This information is in the 'onclick' attribute.
    #print("File ID:\t\t\t\t", tag['onclick'][15:-3])
    #print("")

    # Save the name of the file and the file id in a dictionary.
    files_to_download[tag.text.split("/")[0]] = tag['onclick'][15:-3]
    #print(files_to_download)

# 3) Download the files!

# Define the root of the URI of the file that you want to download.
uri_root = constants.CRS_DOWNLOAD_PATH

#https://stats.oecd.org/FileView2.aspx?IDFile=b64f050c-4e2f-44ed-a8e6-db32ce00fd4f

# Store the date on which the download was made in a string.
download_date = time.strftime("%Y_%m_%d")

# Create a folder in the current directory named with the download date.
current_directory = os.getcwd()
content_directory = os.path.join(constants.TMP_DOWNLOAD_PATH,"Crs_"+download_date)
print("Creating directory " + content_directory + " in:\t " + constants.TMP_DOWNLOAD_PATH)
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

# Sort the keys (file names) of the dictionary so that you download the files in order.
to_get = list(files_to_download.keys())
to_get.sort()

# Download the files in order.
for file in to_get:

    # Replace the "_" in the file ids with "-".
    uri_suffix = files_to_download[file].replace("_", "-")

    # Define the full URI.
    uri = uri_root + uri_suffix

    # Define the name of the target file.
    name = str(file).strip() + ".zip"
    name = name.replace(" ", "_")
    name = name.replace("-", "_")

    # Add the download date to the file name.
    name = download_date + "_" + name

    # Display download information for the user.
    print("Downloading OECD CRS:\t\t\t", file)
    print("Downloading from:\t\t\t", uri)
    print("Saving data as:\t\t\t\t", name)
    print("...")
    print("")

    # This does not work in Python3!
    # Download the file.
    #page = urllib.URLopener()
    #page.retrieve(uri, name)

    # This solution came from:
    # http://stackoverflow.com/questions/7243750/download-file-from-web-in-python-3 
    # Download the file from 'uri' and save it locally under 'name':
    RemoteCrs.urlretrieve(uri, name,reporthook)

# Finished!
print("Finished.\t\t\t")

# Change back into the current directory.
os.chdir(current_directory)
print("In directory:\t\t\t\t", current_directory)
