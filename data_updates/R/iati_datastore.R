list.of.packages <- c("data.table", "here", "RPostgreSQL","jsonlite","curl")
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

table.quote = c("repo","iati_datastore")
base_url = "http://datastore.iatistandard.org/api/1/access/activity.csv?stream=True"
chunk.size=1000

iati.col.names = c(
  "iati_identifier"
  ,"hierarchy"
  ,"last_updated_datetime"
  ,"default_language"
  ,"reporting_org"
  ,"reporting_org_ref"
  ,"reporting_org_type"
  ,"reporting_org_type_code"
  ,"title"
  ,"description"
  ,"activity_status_code"
  ,"start_planned"
  ,"end_planned"
  ,"start_actual"
  ,"end_actual"
  ,"participating_org_Accountable"
  ,"participating_org_ref_Accountable"
  ,"participating_org_type_Accountable"
  ,"participating_org_type_code_Accountable"
  ,"participating_org_Funding"
  ,"participating_org_ref_Funding"
  ,"participating_org_type_Funding"
  ,"participating_org_type_code_Funding"
  ,"participating_org_Extending"
  ,"participating_org_ref_Extending"
  ,"participating_org_type_Extending"
  ,"participating_org_type_code_Extending"
  ,"participating_org_Implementing"
  ,"participating_org_ref_Implementing"
  ,"participating_org_type_Implementing"
  ,"participating_org_type_code_Implementing"
  ,"recipient_country_code"
  ,"recipient_country"
  ,"recipient_country_percentage"
  ,"recipient_region_code"
  ,"recipient_region"
  ,"recipient_region_percentage"
  ,"sector_code"
  ,"sector"
  ,"sector_percentage"
  ,"sector_vocabulary"
  ,"sector_vocabulary_code"
  ,"collaboration_type_code"
  ,"default_finance_type_code"
  ,"default_flow_type_code"
  ,"default_aid_type_code"
  ,"default_tied_status_code"
  ,"default_currency"
  ,"currency"
  ,"total_Commitment"
  ,"total_Disbursement"
  ,"total_Expenditure"
  ,"total_IncomingFunds"
  ,"total_InterestRepayment"
  ,"total_LoanRepayment"
  ,"total_Reimbursement"
)
iati.field.types=c(
"text"
,"integer"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"text"
,"float8"
,"float8"
,"float8"
,"float8"
,"float8"
,"float8"
,"float8"
)
names(iati.field.types) = iati.col.names

total_count = fromJSON("http://datastore.iatistandard.org/api/1/access/activity?limit=0")["total-count"][[1]]

index = 0
url_con = curl(base_url)
open(url_con, "r")

pb = txtProgressBar(max=total_count, style=3)
while(isIncomplete(url_con)){
  dataChunk = read.csv(url_con, nrows=chunk.size, skip=0, header=(index==0), col.names=iati.col.names, as.is=T, na.strings=c("","!Mixed currency","N/A"))
  dbWriteTable(con, name = table.quote, value = dataChunk, row.names = F, overwrite=(index==0), append=(index>0), field.types=iati.field.types)
  index = index + nrow(dataChunk)
  setTxtProgressBar(pb, index)
  rm(dataChunk)
}
close(pb)
close(url_con)
dbDisconnect(con)
