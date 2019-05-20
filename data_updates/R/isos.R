list.of.packages <- c("data.table", "RPostgreSQL","reshape2")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)


# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "/home/alex/git/ddw-analyst-ui"
source(paste0(script.dir,"/data_updates/R/constants.R"))

drv = dbDriver("PostgreSQL")

# con = dbConnect(drv,
#                 dbname="analyst_ui"
#                 ,user="postgres")
con = dbConnect(drv,
                dbname=db.dbname
                ,user=db.user
                ,password=db.password
                ,host=db.host
                ,port=db.port)

# setwd("~/git/ddw-analyst-ui")
setwd("/src")

tab = fread("database_setup/col_desc.csv")
tab = subset(tab,column_type!="")
# tab = subset(tab,table_name=="fts")

tables = unique(tab$table_name)

pb = txtProgressBar(min=1, max=length(tables), style=3)
for(i in 1:length(tables)){
  setTxtProgressBar(pb, i)
  table = tables[i]
  tab_sub = subset(tab,table_name==table)
  col_types = tab_sub$column_type
  col_names = tab_sub$column_name
  quoted_names = paste0('"',col_names,'"')
  col_names_paste = paste(quoted_names,collapse=", ")
  table.query = paste0('SELECT ', col_names_paste,' FROM "repo"."',table,'";')
  res = dbGetQuery(con,table.query)
  names(res) = col_types
  res.l = as.data.frame(lapply(split(lapply(res, 
                                    as.character), 
                             names(res)), 
                       unlist))
  res.l = unique(res.l)
  if("region_code" %in% names(res.l) | "region_name" %in% names(res.l)){
    if(is.null(res.l$region_code)){
      res.l$region_code = NA
    }
    if(is.null(res.l$region_name)){
      res.l$region_name = NA
    }
    reg_result = unique(res.l[,c("region_name", "region_code")])
    write.csv(reg_result,paste0("data_updates/manual/CSV/",table,"_regisos.csv"),row.names=F,na="",fileEncoding="utf8")
  }
  if("country_code" %in% names(res.l) | "country_name" %in% names(res.l)){
    if(is.null(res.l$country_code)){
      res.l$country_code = NA
    }
    if(is.null(res.l$country_name)){
      res.l$country_name = NA
    }
    country_result = unique(res.l[,c("country_name", "country_code")])
    write.csv(country_result,paste0("data_updates/manual/CSV/",table,"_isos.csv"),row.names=F,na="",fileEncoding="utf8")
  }
  
}
close(pb)

dbDisconnect(con)