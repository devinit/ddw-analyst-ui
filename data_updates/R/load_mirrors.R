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
                dbname="analyst_ui"
                ,user="analyst_ui_user"
                ,password="analyst_ui_pass"
                ,host="db"
                ,port=5432)
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

clean_dac2a_file = function(){
  
  dac2a <- fread(dac2a_path)
  setnames(dac2a,
           c('RECIPIENT',
                   'Recipient',
                   'DONOR',
                   'Donor',
                    'PART',
                   'Part',
                   'AIDTYPE',
                   'Aid type',
                   'DATATYPE',
                   'Amount type',
                   'TIME',
                   'Year',
                   'Value',
                   'Flags')
                   ,
           c('recipient_code',
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
             ));
  
  dbWriteTable(con, name = dac2a.table.quote, value = dac2a, row.names = F, overwrite = T)
}

clean_dac2b_file = function(){
  
  dac2b <- fread(dac2b_path)
  setnames(dac2b,
           c('RECIPIENT'
             ,'Recipient'
             ,'DONOR'
             ,'Donor'
             ,'PART'
             ,'Part'
             ,'AIDTYPE'
             ,'Aid type'
             ,'DATATYPE'
             ,'Amount type'
             ,'TIME'
             ,'Year'
             ,'Value'
             ,'Flags')
           ,
           c('recipient_code',
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
           ));
  
  dbWriteTable(con, name = dac2b.table.quote, value = dac2b, row.names = F, overwrite = T)
  
}

clean_dac5_file = function(){
  dac5 <- fread(dac5_path)
  setnames(dac5,
           c('DONOR'
             ,'Donor'
             ,'SECTOR'
             ,'Sector'
             ,'AIDTYPE'
             ,'Aid type'
             ,'AMOUNTTYPE'
             ,'Amount type'
             ,'TIME'
             ,'Year'
             ,'Value'
             ,'Flags')
           ,
           c('donor_code'
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
           ));
  
  dbWriteTable(con, name = dac5.table.quote, value = dac5, row.names = F, overwrite = T)

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
    "float8",
    "text",
    "text",
    "float8",
    "float8",
    "float8",
    "float8",
    "float8",
    "bool",
    "bool",
    "integer",
    "integer",
    "float8"
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
    ,"grant_equivalent" # Guessed column name
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
    ,"channel_parent_category" # Guessed column name
    ,"geography"
    ,"expected_start_date"
    ,"completion_date"
    ,"long_description"
    ,"gender"
    ,"environment"
    ,"trade"
    ,"pdgg"
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
    ,"grant_element"
    ,"usd_interest"
    ,"usd_outstanding"
    ,"usd_arrears_principal"
    ,"usd_arrears_interest"
    ,"usd_future_debt_service_principal"
    ,"usd_future_debt_service_interest"
    ,"rmnch"
    ,"budget_identifier"
    ,"capital_expenditure"
  )
  
  overwrite_crs = TRUE
  for(txt in file_vec){
    crs = fread(txt,sep="|")
    setnames(crs,
             c(
               "Year"
               ,"DonorCode"
               ,"DonorName"
               ,"AgencyCode"
               ,"AgencyName"
               ,"CRSid"
               ,"ProjectNumber"
               ,"InitialReport"
               ,"RecipientCode"
               ,"RecipientName"
               ,"RegionCode"
               ,"RegionName"
               ,"IncomegroupCode"
               ,"IncomegroupName"
               ,"FlowCode"
               ,"FlowName"
               ,"bi_multi"
               ,"Category"
               ,"Finance_t"
               ,"Aid_t"
               ,"usd_commitment"
               ,"usd_disbursement"
               ,"usd_received"
               ,"usd_commitment_defl"
               ,"usd_disbursement_defl"
               ,"usd_received_defl"
               ,"usd_adjustment"
               ,"usd_adjustment_defl"
               ,"usd_amountuntied"
               ,"usd_amountpartialtied"
               ,"usd_amounttied"
               ,"usd_amountuntied_defl"
               ,"usd_amountpartialtied_defl"
               ,"usd_amounttied_defl"
               ,"usd_IRTC"
               ,"usd_expert_commitment"
               ,"usd_expert_extended"
               ,"usd_export_credit"
               ,"CurrencyCode"
               ,"commitment_national"
               ,"disbursement_national"
               ,"GrantEquiv"
               ,"usd_GrantEquiv"
               ,"ShortDescription"
               ,"ProjectTitle"
               ,"PurposeCode"
               ,"PurposeName"
               ,"SectorCode"
               ,"SectorName"
               ,"ChannelCode"
               ,"ChannelName"
               ,"ChannelReportedName"
               ,"ParentChannelCode"
               ,"Geography"
               ,"ExpectedStartDate"
               ,"CompletionDate"
               ,"LongDescription"
               ,"Gender"
               ,"Environment"
               ,"Trade"
               ,"Pdgg"
               ,"FTC"
               ,"PBA"
               ,"InvestmentProject"
               ,"AssocFinance"
               ,"biodiversity"
               ,"climateMitigation"
               ,"climateAdaptation"
               ,"desertification"
               ,"commitmentdate"
               ,"typerepayment"
               ,"numberrepayment"
               ,"interest1"
               ,"interest2"
               ,"repaydate1"
               ,"repaydate2"
               ,"grantelement"
               ,"usd_interest"
               ,"usd_outstanding"
               ,"usd_arrears_principal"
               ,"usd_arrears_interest"
               ,"usd_future_DS_principal"
               ,"usd_future_DS_interest"
               ,"RMNCH"
               ,"BudgetIdent"
               ,"CapitalExpend"
             )
             ,
             c(
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
               ,"grant_equivalent" # Guessed column name
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
               ,"channel_parent_category" # Guessed column name
               ,"geography"
               ,"expected_start_date"
               ,"completion_date"
               ,"long_description"
               ,"gender"
               ,"environment"
               ,"trade"
               ,"pdgg"
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
               ,"grant_element"
               ,"usd_interest"
               ,"usd_outstanding"
               ,"usd_arrears_principal"
               ,"usd_arrears_interest"
               ,"usd_future_debt_service_principal"
               ,"usd_future_debt_service_interest"
               ,"rmnch"
               ,"budget_identifier"
               ,"capital_expenditure"
             ));
    dbWriteTable(
      con,
      name = crs.table.quote,
      value = crs,
      row.names = F,
      overwrite = overwrite_crs,
      append=!overwrite_crs,
      field.types=crs_field_types)
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

