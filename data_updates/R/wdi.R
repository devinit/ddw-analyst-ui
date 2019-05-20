list.of.packages <- c("data.table","httr","utils","RPostgreSQL","reshape2","here")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)


# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "/home/alex/git/ddw-analyst-ui"
source(paste0(script.dir,"/data_updates/R/constants.R"))

make.sql.names <- function(x){
  return(substr(iconv(gsub(".","_",make.names(x),fixed=T),to="ASCII",sub=""),1,63))
}

drv = dbDriver("PostgreSQL")
con = dbConnect(drv,
                dbname=db.dbname
                ,user=db.user
                ,password=db.password
                ,host=db.host
                ,port=db.port)
# con = dbConnect(drv,
#                 dbname="analyst_ui"
#                 ,user="postgres")

table.name = "wdi"
table.quote = c("repo",table.name)

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
  wdi[,V64:=NULL]
  names(wdi)[1:4] = tolower(make.sql.names(make.names(names(wdi)[1:4])))

  # Append melt
  id.vars=c("country_name","country_code", "indicator_name", "indicator_code")
  variable.name="year"
  chunk.size=5000
  num_chunks = floor(nrow(wdi)/chunk.size)
  pb = txtProgressBar(max=num_chunks,style=3)
  for(i in 0:num_chunks){
    setTxtProgressBar(pb, i)
    start_ind = 1 + (i * chunk.size)
    end_ind = (i+1) * chunk.size
    end_ind = min(end_ind,nrow(wdi))
    chunk = wdi[start_ind:end_ind,]
    chunk.m = melt(chunk,id.vars=id.vars,variable.name=variable.name)
    rm(chunk)
    gc()
    dbWriteTable(con, name = table.quote, value = chunk.m, row.names = F, overwrite = (i==0), append = (i>0))
    rm(chunk.m)
    gc()
  }
  close(pb)
  dbDisconnect(con)
}else{
  stop("HTTP error: ",res$status_code)
}
