list.of.packages <- c("data.table","XML","RPostgreSQL")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)


# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "/home/alex/git/ddw-analyst-ui"
source(paste0(script.dir,"/data_updates/R/constants.R"))

drv = dbDriver("PostgreSQL")
con = dbConnect(drv,
                dbname=db.dbname
                ,user=db.user
                ,password=db.password
                ,host=db.host
                ,port=db.port)

table.name = "PovCalNetDist"
table.quote = c("repo",table.name)

remap_cov = function(x){
  cov_dict = c(
    "R"=1,
    "U"=2,
    "N"=3,
    "A"=NA
  )
  return(cov_dict[as.character(x)])
}
remap_cov = Vectorize(remap_cov)

povcal_svy = function(pl=1.9,group.by="WB"){
  url = "http://iresearch.worldbank.org/PovcalNet/PovcalNetAPI.ashx?"
  params = list(
    "Countries"="all",
    "PovertyLine"=as.character(pl),
    "SurveyYears"="all",
    "Display"="C",
    "GroupedBy"=group.by,
    "format"="csv"
  )
  param_names = names(params)
  for(param_name in param_names){
    param = params[[param_name]]
    url = paste0(url,param_name,"=",param,"&")
  }
  url = substr(url,1,nchar(url)-1)
  return(read.csv(url))
}

povcal_dist = function(C0="AGO_3",Y0=2015){
  dist_url = paste0("http://iresearch.worldbank.org/PovcalNet/Detail.aspx?Format=Detail&C0=",C0,"&Y0=",Y0)
  dist_html = htmlParse(dist_url, isURL=T)
  dist_root = xmlRoot(dist_html)
  dist_txt = xmlValue(getNodeSet(dist_root, "//pre")[[1]])
  start_point = gregexpr(pattern="---\r\n", dist_txt)[[1]][4]
  end_point = gregexpr(pattern="\r\n---", dist_txt)[[1]][5]
  if(start_point<end_point){
    txt_table = substr(dist_txt,start_point+5,end_point-1)
    df = read.table(text=txt_table, header=F, col.names=c("i","P", "L"))
    return(df)
  }else{
    return(NULL)
  }
}

ext = povcal_svy()
ext$svy_code = remap_cov(ext$CoverageType)
ext = subset(ext,!is.na(svy_code))
ext$C0 = paste(ext$CountryCode,ext$svy_code,sep="_")


data.list = list()
data.index = 1
errs = c()

pb = txtProgressBar(min=1, max=nrow(ext), style=3)
for(i in 1:nrow(ext)){
  svy = ext[i,"C0"]
  year = ext[i,"DataYear"]
  msg_lbl = paste(svy,year)
  setTxtProgressBar(pb, i, label=msg_lbl)
  dist.tmp = tryCatch({povcal_dist(svy, year)},error=function(e){return(NULL)})
  if(!is.null(dist.tmp)){
    dist.tmp$svy = svy
    dist.tmp$year = year
    dist.tmp$country_code = substr(svy,1,3)
    data.list[[data.index]] = dist.tmp
    data.index = data.index + 1
  }else{
    errs = c(errs, msg_lbl)
  }
}
close(pb)

all_dist = rbindlist(data.list)

dbWriteTable(con, name = table.quote, value = all_dist, row.names = F, overwrite = T)
dbDisconnect(con)
