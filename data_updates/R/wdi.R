list.of.packages <- c("data.table","httr","utils","RPostgreSQL","reshape2")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

make.sql.names <- function(x){
  return(substr(iconv(gsub(".","_",make.names(x),fixed=T),to="ASCII",sub=""),1,63))
}

melt_chunk <- function(x, id.vars, variable.name, chunk.size=1000){
  data_list = list()
  num_chunks = floor(nrow(x)/chunk.size)
  for(i in 0:num_chunks){
    message("Melting chunk ",i,"/",num_chunks)
    start_ind = 1 + (i * chunk.size)
    end_ind = (i+1) * chunk.size
    end_ind = min(end_ind,nrow(x))
    chunk = x[start_ind:end_ind]
    chunk.m = melt(chunk,id.vars=id.vars,variable.name=variable.name)
    data_list[[i+1]] = chunk.m
  }
  return(rbindlist(data_list))
}

drv = dbDriver("PostgreSQL")
con = dbConnect(drv,
                dbname="analyst_ui"
                ,user="analyst_ui_user"
                ,password="analyst_ui_pass"
                ,host="db"
                ,port=5432)

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
  wdi.m = melt_chunk(wdi,id.vars=c("country_name","country_code", "indicator_name", "indicator_code"),variable.name="year")
  rm(wdi)
  gc()
  dbWriteTable(con, name = table.quote, value = wdi.m, row.names = F, overwrite = T)
  dbDisconnect(con)
}else{
  stop("HTTP error: ",res$status_code)
}
