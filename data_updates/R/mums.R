list.of.packages <- c("data.table","RPostgreSQL","reshape2","here")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
# script.dir <- here()
# script.dir = "/src"
script.dir = "C:/git/ddw-analyst-ui"
setwd("C:/git/ddw-analyst-ui/data_updates/R")
source(paste0(script.dir,"/data_updates/R/constants.R"))

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

table.name = "mums"
table.quote = c("repo",table.name)

# Load data, removing na strings 

unzip("MultiSystem entire dataset.zip")
mums = read.table("MultiSystem entire dataset.txt",header=T,sep="|",quote="",fill=TRUE)

dbWriteTable(con, name = table.quote, value = mums, row.names = F, overwrite = T)
dbDisconnect(con)