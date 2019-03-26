list.of.packages <- c("data.table","httr","utils")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

ckan.url = "https://datacatalog.worldbank.org/api/3/action/package_show?id=90a34ea4-8a5c-11e6-ae22-56b6b64001"

res = GET(ckan.url)
if(res$status_code==200){
  dat = content(res)
  resources = dat$result[[1]]$resources
  resource_names = sapply(resources,`[`,"name")
  csv_index = resource_names == "CSV"
  csv_resource = resources[csv_index][[1]]
  csv_url = csv_resource$url
  tmp.zip = tempfile(fileext = ".zip")
  download.file(url=csv_url,destfile=tmp.zip)
  tmp.csv = unzip(tmp.zip,files="WDIData.csv",exdir="/tmp")
  wdi = fread(tmp.csv, header=T)
  wdi$V64 = NULL
  # Connect to DB and upload
}else{
  stop("HTTP error: ",res$status_code)
}
