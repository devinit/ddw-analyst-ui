list.of.packages <- c("data.table","httr","RPostgreSQL","here")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
# script.dir <- here()
# script.dir = "/src"
script.dir = "/home/alex/git/ddw-analyst-ui"

source(paste0(script.dir,"/data_updates/R/constants.R"))

drv = dbDriver("PostgreSQL")
# con = dbConnect(drv,
#                 dbname=db.dbname
#                 ,user=db.user
#                 ,password=db.password
#                 ,host=db.host
#                 ,port=db.port)
con = dbConnect(drv,
                dbname="analyst_ui"
                ,user="postgres")

source.table.name = "fts"
source.table.quote = c("repo",table.name)


dbDisconnect(con)

