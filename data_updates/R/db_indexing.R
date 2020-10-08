list.of.packages <- c("RPostgreSQL","here")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "/home/alex/git/ddw-analyst-ui"
source(paste0(script.dir,"/data_updates/R/constants.R"))

text_index = list(
"crs_current"=c("project_title","short_description","long_description","donor_name","channel_name","sector_name"),
"dac5_current"=c("donor_name","sector_name"),
"dac2b_current"=c("recipient_name","donor_name"),
"dac2a_current"=c("recipient_name","donor_name"),
"dac1_current"=c("donor_name","part_name"),
"iati_transactions"=c("iati_identifier","title_narrative","description_narrative","transaction_description_narrative")
)

numeric_index = list(
    "crs_current"=c("donor_code","recipient_code","sector_code","channel_code"),
    "dac2b_current"=c("recipient_code","donor_code"),
    "dac5_current"=c("donor_code","sector_code"),
    "dac2a_current"=c("recipient_code","donor_code"),
    "dac1_current"=c("donor_code","part_code")
)

btree_index = list(
  "iati_transactions"=c(
    "iati_identifier",
    "x_transaction_year",
    "x_yyyymm",
    "x_sector_code",
    "x_dac3_sector",
    "x_recipient",
    "x_recipient_code",
    "x_recipient_type",
    "reporting_org_type_code",
    "transaction_type_code",
    "x_sector_number",
    "x_recipient_number",
    "x_vocabulary_number"
    )
)

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


table_names = names(text_index)

for(table_name in table_names){
    columns_to_index = text_index[[table_name]]
    col_concat = paste(columns_to_index,collapse=",")

    pr_sql_query = paste0("drop index repo.",table_name,"_txt_srch_idx")
    sql_query = paste0("create index ",table_name,"_txt_srch_idx on repo.", table_name," using gin (",col_concat,")")
    
     tryCatch({
        dbSendQuery(con,pr_sql_query)
     },error = function(e){
        
     })

    dbSendQuery(con,sql_query)   
}


table_names = names(numeric_index)

for(table_name in table_names){
    columns_to_index = numeric_index[[table_name]]
    col_concat = paste(columns_to_index,collapse=",")

    pr_sql_query = paste0("drop index repo.",table_name,"_numeric_idx")
    sql_query = paste0("create index ",table_name,"_numeric_idx on repo.", table_name," (",col_concat,")")
    tryCatch({ 
        dbSendQuery(con,pr_sql_query)
     },error = function(e){
        
     })

    dbSendQuery(con,sql_query)   
    
}

table_names = names(btree_index)

for(table_name in table_names){
  columns_to_index = btree_index[[table_name]]
  for(column_to_index in columns_to_index){
    pr_sql_query = paste0("drop index repo.",table_name,"_btree_idx")
    sql_query = paste0("create index ",table_name,"_btree_idx on repo.", table_name," using btree (",column_to_index,")")
    
    tryCatch({
      dbSendQuery(con,pr_sql_query)
    },error = function(e){
      
    })
    
    dbSendQuery(con,sql_query)   
  }
}

dbCommit(con)
dbDisconnect(con)


