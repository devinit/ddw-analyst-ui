list.of.packages <- c("data.table", "here", "RPostgreSQL")
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

crs_path = paste0(tmp_file_directory,"Crs_latest")
crs.table.name = "crs_current"
crs.table.quote = c("repo",crs.table.name)

table1_latest_path = paste0(tmp_file_directory,"Table1_latest")
dac1_path = list.files(path=table1_latest_path, pattern="*.csv", ignore.case=T, full.names=T)
dac1.table.name = "dac1_current"
dac1.table.quote = c("repo",dac1.table.name)

table2a_latest_path = paste0(tmp_file_directory,"Table2a_latest")
dac2a_path = list.files(path=table2a_latest_path, pattern="*.csv", ignore.case=T, full.names=T)
dac2a.table.name = "dac2a_current"
dac2a.table.quote = c("repo",dac2a.table.name)

table2b_latest_path = paste0(tmp_file_directory,"Table2b_latest")
dac2b_path = list.files(path=table2b_latest_path, pattern="*.csv", ignore.case=T, full.names=T)
dac2b.table.name = "dac2b_current"
dac2b.table.quote = c("repo",dac2b.table.name)

table5_latest_path = paste0(tmp_file_directory,"Table5_latest")
dac5_path = list.files(path=table5_latest_path, pattern="*.csv", ignore.case=T, full.names=T)
dac5.table.name = "dac5_current"
dac5.table.quote = c("repo",dac5.table.name)

chunk_load_table = function(con, table.quote, filename, col.names, quote="\"", sep=",", field.types=NULL, allow.overwrite=TRUE, encoding="latin1", chunk.size=5000){
  index = 0
  message(filename)
  file_con = file(description=filename, open="r", encoding=encoding)
  repeat{
    index = index + 1
    dataChunk = read.delim(file_con, nrows=chunk.size, skip=0, header=(index==1), sep=sep, col.names=col.names, as.is=T, na.strings=c("\032",""),quote=quote)
    dataChunk = dataChunk[rowSums(is.na(dataChunk)) != ncol(dataChunk),]
    dbWriteTable(con, name = table.quote, value = dataChunk, row.names = F, overwrite=((index==1) & allow.overwrite), append=((index>1) | !allow.overwrite), field.types=field.types)
    if(nrow(dataChunk) != chunk.size){
      break
    }
    rm(dataChunk)
    gc()
  }
  close(file_con)
}

clean_dac2a_file = function(){
  dac2a.names = c('recipient_code',
                  'recipient_name',
                  'donor_code',
                  'donor_name',
                  'part_code',
                  'part_name',
                  'aid_type_code',
                  'aid_type_name',
                  'data_type',
                  'amount_type',
                  'time',
                  'year',
                  'value',
                  'flags'
                )
  chunk_load_table(con, dac2a.table.quote, dac2a_path, dac2a.names)
}

clean_dac2b_file = function(){
  dac2b.names = c('recipient_code',
                  'recipient_name',
                  'donor_code',
                  'donor_name',
                  'part_code',
                  'part_name',
                  'aid_type_code',
                  'aid_type_name',
                  'data_type',
                  'amount_type',
                  'time',
                  'year',
                  'value',
                  'flags'
  )
  chunk_load_table(con, dac2b.table.quote, dac2b_path, dac2b.names)
}

clean_dac5_file = function(){
  dac5.names = c('donor_code'
                 ,'donor_name'
                 ,'sector_code'
                 ,'sector_name'
                 ,'aid_type_code'
                 ,'aid_type_name'
                 ,'amount_type_code'
                 ,'amount_type_name'
                 ,'time'
                 ,'year'
                 ,'value'
                 ,'flags'
  )
  chunk_load_table(con, dac5.table.quote, dac5_path, dac5.names)
}


clean_dac1_file = function(){
  dac1 <- fread(dac1_path)
  setnames(dac1,
           c('DONOR'
             ,'Donor'
             ,'PART'
             ,'Part'
             ,'AIDTYPE'
             ,'Aid type'
             ,'FLOWS'
             ,'Fund flows'
             ,'AMOUNTTYPE'
             ,'Amount type'
             ,'TIME'
             ,'Year'
             ,'Value'
             ,'Flags')
           ,
           c('donor_code'
             ,'donor_name'
             ,'part_code'
             ,'part_name'
             ,'aid_type_code'
             ,'aid_type_name'
             ,'flows'
             ,'fund_flows'
             ,'amount_type_code'
             ,'amount_type_name'
             ,'time'
             ,'year'
             ,'value'
             ,'flags'
           ));

  dbWriteTable(con, name = dac1.table.quote, value = dac1, row.names = F, overwrite = T)
}

merge_crs_tables = function(file_vec){
  crs_field_types = c(
    "integer",
    "integer",
    "text",
    "integer",
    "text",
    "text",
    "text",
    "integer",
    "integer",
    "text",
    "integer",
    "text",
    "integer",
    "text",
    "integer",
    "text",
    "integer",
    "integer",
    "integer",
    "text",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "integer",
    "float8",
    "float8",
    "float8",
    "float8",
    "text",
    "text",
    "integer",
    "text",
    "integer",
    "text",
    "integer",
    "text",
    "text",
    "integer",
    "text",
    "text",
    "text",
    "text",
    "text",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "integer",
    "text",
    "integer",
    "integer",
    "text",
    "text",
    "text",
    "text",
    "float8",
    "float8",
    "float8",
    "float8",
    "integer",
    "float8",
    "integer",
    "integer",
    "text",
    "text"
  )
  names(crs_field_types) = c(
    "year"
    ,"donor_code"
    ,"donor_name"
    ,"agency_code"
    ,"agency_name"
    ,"crs_id"
    ,"project_number"
    ,"initial_report"
    ,"recipient_code"
    ,"recipient_name"
    ,"region_code"
    ,"region_name"
    ,"income_group_code"
    ,"income_group_name"
    ,"flow_code"
    ,"flow_name"
    ,"bilateral_multilateral"
    ,"category"
    ,"finance_type"
    ,"aid_type"
    ,"usd_commitment"
    ,"usd_disbursement"
    ,"usd_received"
    ,"usd_commitment_deflated"
    ,"usd_disbursement_deflated"
    ,"usd_received_deflated"
    ,"usd_adjustment"
    ,"usd_adjustment_deflated"
    ,"usd_amount_untied"
    ,"usd_amount_partial_tied"
    ,"usd_amount_tied"
    ,"usd_amount_untied_deflated"
    ,"usd_amount_partial_tied_deflated"
    ,"usd_amount_tied_deflated"
    ,"usd_irtc"
    ,"usd_expert_commitment"
    ,"usd_expert_extended"
    ,"usd_export_credit"
    ,"currency_code"
    ,"commitment_national"
    ,"disbursement_national"
    ,"grant_equivalent"
    ,"usd_grant_equivalent"
    ,"short_description"
    ,"project_title"
    ,"purpose_code"
    ,"purpose_name"
    ,"sector_code"
    ,"sector_name"
    ,"channel_code"
    ,"channel_name"
    ,"channel_reported_name"
    ,"channel_parent_category"
    ,"geography"
    ,"expected_start_date"
    ,"completion_date"
    ,"long_description"
    ,"sdg_focus" # New for 2018
    ,"gender"
    ,"environment"
    ,"pdgg"
    ,"trade"
    ,"rmnch"
    ,"drr" # New for 2018
    ,"nutrition" # New for 2018
    ,"disability" # New for 2018
    ,"ftc"
    ,"pba"
    ,"investment_project"
    ,"associated_finance"
    ,"biodiversity"
    ,"climate_mitigation"
    ,"climate_adaptation"
    ,"desertification"
    ,"commitment_date"
    ,"type_repayment"
    ,"number_repayment"
    ,"interest_1"
    ,"interest_2"
    ,"repay_date_1"
    ,"repay_date_2"
    ,"usd_interest"
    ,"usd_outstanding"
    ,"usd_arrears_principal"
    ,"usd_arrears_interest"
    ,"budget_identifier"
    ,"capital_expenditure"
    ,"psi_flag" # New for 2018
    ,"psi_add_type" # New for 2018
    ,"psi_add_assess" # New for 2018
    ,"psi_add_dev_obj" # New for 2018
    # ,"grant_element" # Removed for 2018
    # ,"usd_future_debt_service_principal" # Removed for 2018
    # ,"usd_future_debt_service_interest" # Removed for 2018
  )
  overwrite_crs = TRUE
  for(txt in file_vec){
    chunk_load_table(con, crs.table.quote, txt, names(crs_field_types), quote="", sep="|", field.types=crs_field_types, allow.overwrite=overwrite_crs)
    overwrite_crs = FALSE
  }

}

clean_crs_file = function(){
  file_list <- list.files(path = crs_path,pattern = "*.txt",full.names = TRUE,recursive = FALSE);
  merge_crs_tables(file_list);
}

clean_crs_file()

clean_dac2a_file()

clean_dac1_file()

clean_dac2b_file()

clean_dac5_file()

dbDisconnect(con)
