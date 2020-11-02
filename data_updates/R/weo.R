list.of.packages <- c("data.table","RPostgreSQL","reshape2","here")
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
# con = dbConnect(drv,
#                 dbname="analyst_ui"
#                 ,user="postgres")

table.name = "weo"
table.quote = c("repo",table.name)

# Load data, removing na strings
data_url = "https://www.imf.org/~/media/Files/Publications/WEO/WEO-Database/2020/02/WEOOct2020all.ashx"
download.file(data_url,"/tmp/weo.csv")
weo = read.csv("/tmp/weo.csv",sep="\t",na.strings=c("","n/a","--"),fileEncoding = "utf-16")
weo$X = NULL
weo = subset(weo,WEO.Country.Code!="International Monetary Fund, World Economic Outlook Database, October 2020")

value_cols = paste0("X",c(1980:2025))
id_cols = setdiff(names(weo),value_cols)

# Dataset has commas in numbers, which need to be removed and parsed as numbers
weo[,value_cols] = as.numeric(sapply(weo[,value_cols],gsub,pattern=",",replacement=""))

# From reshape2 package, melt turns dataset as long as it can go
weo.m = melt(weo,id.vars=id_cols)

# Remove the leading X now that year is no longer a variable name
weo.m$year = as.numeric(substr(weo.m$variable,2,5))
weo.m$variable = NULL

dbWriteTable(con, name = table.quote, value = weo.m, row.names = F, overwrite = T)
dbDisconnect(con)