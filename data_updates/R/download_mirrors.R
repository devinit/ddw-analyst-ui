# Check whether packages are installed, and install them
list.of.packages <- c("scrapeR")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

download_oecd_zip = function(table_name, zip_location){
  download_url = paste0("https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=",table_name)
  data_root = "https://stats.oecd.org/FileView2.aspx?IDFile="
  
  # Download the page source
  download_source = scrape(download_url, headers=T,follow=T,parse=T)[[1]]
  
  # Extract the link elements
  link_elems = getNodeSet(download_source,"//a")
  
  # The links don't store normal href objects, but we can construct new links from the `onclick` function
  download_funcs = sapply(link_elems,xmlGetAttr,"onclick")
  file_ids = gsub("_","-",substr(download_funcs,16,51))
  
  # Get filenames from link names
  download_names = sapply(link_elems,xmlValue)
  file_names = paste0(sapply(strsplit(download_names," / "),`[`,1),".zip")
  
  # Download the files if they don't already exist
  for(i in 1:length(file_ids)){
    file_id = file_ids[i]
    file_name = file_names[i]
    file_path = paste0(zip_location,"/",file_name)
    if(!file.exists(file_path)){
      message("Downloading ", file_name)
      download.file(paste0(data_root, file_id), file_path)
      unzip(file_path,exdir=zip_location)
    }
  }
}

dac2a_path <- "~/ddw_update/data_source/oecd_dac_table_2a"
download_oecd_zip("TABLE2A",dac2a_path)

dac2b_path <- "~/ddw_update/data_source/oecd_dac_table_2b"
download_oecd_zip("TABLE2B",dac2b_path)

dac5_path <- "~/ddw_update/data_source/oecd_dac_table_5"
download_oecd_zip("TABLE5",dac5_path)

dac1_path <- "~/ddw_update/data_source/oecd_dac_table_1"
download_oecd_zip("TABLE1",dac1_path)

crs1_path <- "~/ddw_update/data_source/oecd_dac_crs"
download_oecd_zip("CRS1",crs1_path)
