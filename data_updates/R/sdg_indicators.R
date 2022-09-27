list.of.packages <- c("data.table","RPostgreSQL","reshape2","here","Unicode")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "C:/git/ddw-analyst-ui"
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

dbListTables(con)

table.name = "sdg_indicators"
table.quote = c("repo",table.name)

# Load data, removing na strings
data_url = paste0(script.dir,"/data_updates/manual/CSV/sdg_indicators.csv")
sdg = read.csv(data_url)

sdg = cbind(sdg,colsplit(sdg$indicator,"\\.",names = c("goal2","target2","indicator2")))
sdg$alpha <- NA
sdg$alpha2 <- NA
sdg$indicator2 <- as.character(sdg$indicator2)

for (k in c(1:nrow(sdg))){
  sdg$alpha[k] <- utf8ToInt(sdg$target2[k])
  sdg$alpha2[k] <- utf8ToInt(sdg$indicator2[k])
}

sdg$goal3 <- tolower(LETTERS[sdg$goal2])
sdg <- data.table(sdg)[,target3:=frank(alpha,ties.method = "dense"),by=.(goal2)] 
sdg$target3 <- tolower(LETTERS[sdg$target3])
sdg <- data.table(sdg)[,indicator3:=frank(alpha,ties.method = "dense"),by=.(goal2)] 
sdg$indicator3 <- tolower(LETTERS[sdg$indicator3])

sdg$alpha_ordering <- paste0(sdg$goal3,sdg$target3,sdg$indicator3)

sdg = sdg[,c(1:6,15)]

dbWriteTable(con, name = table.quote, value = sdg, row.names = F, overwrite = T)
dbDisconnect(con)