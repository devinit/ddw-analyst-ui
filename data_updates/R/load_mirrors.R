list.of.packages <- c("data.table","tidyverse")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

source("baseYearConstants.R")
#Load dac2a mirror data from source data
#Path to row downloaded data 
#Make sure all files are already extracted
wd <- "~/ddw_update/"
setwd(wd)

dac2a_path <- "~/ddw_update/data_source/oecd_dac_table_2a/Table2a_Data.csv"
dac2b_path <- "~/ddw_update/data_source/oecd_dac_table_2b/Table2b_Data.csv"
dac5_path <- "~/ddw_update/data_source/oecd_dac_table_5/Table5_Data.csv"
dac1_path <- "~/ddw_update/data_source/oecd_dac_table_1/Table1_Data.csv"

#This cannot point to a file, we will be working with several files
#Checking header lengths, invalid characters and missing data content

crs_path <- "~/ddw_update/data_source/oecd_dac_crs"

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
  
  if(!dir.exists('mirrors')){
    dir.create('mirrors')
  }

  fwrite(dac2a,file = 'mirrors/dac2a.csv',append = FALSE);
  rm(dac2a);
  
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
  
  if(!dir.exists('mirrors')){
    dir.create('mirrors')
  }
  
  fwrite(dac2b,file = 'mirrors/dac2b.csv',append = FALSE);
  
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
  
  if(!dir.exists('mirrors')){
    dir.create('mirrors')
  }
  
  fwrite(dac5,file = 'mirrors/dac5.csv',append = FALSE);

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
  
  if(!dir.exists('mirrors')){
    dir.create('mirrors')
  }
  
  fwrite(dac1,file = 'mirrors/dac1.csv',append = FALSE);
}

#This can be done better, read actual files and use ncol before doing processing, that way
#You wont need this method
check_crs_headers = function(file_v){
  
  expected_2016_length <- 86
  
  #Check that the length of the total number of columns match what is expected
  #If column lengths don't match, do a manual visual check to see what has been added or removed
  #All columns need to have the same lenghth for all files of CRS because each change affects all years
  for(fi in file_v){
    
    fo <- file(fi,"r")
    first_line <- readLines(fo,n = 1)
    split_vec <- strsplit(first_line,"|",fixed=TRUE)[[1]]
    
    if((length(split_vec) < expected_2016_length) || (length(split_vec) > expected_2016_length)){
      e <- simpleError(sprintf("Found length %f for file %s but expecting %f ",length(split_vec),fi,expected_2016_length))
      stop(e)
    }
  }
  
 
}

merge_crs_tables = function(file_vec){
  
  if(!dir.exists('crs_cleanup')){
    dir.create('crs_cleanup')
  }
  
  data.list = list()
  data.index = 1
  
  # Loop through, and use the `fread` function from `data.table` package.
  # CRS has some embedded null characters, which we need to fix.
  for(txt in file_vec){
    r = readBin(txt, raw(), file.info(txt)$size)
    r[r==as.raw(0)] = as.raw(0x20) ## replace with 0x20 = <space>
    writeBin(r, paste0("crs_cleanup/",basename(txt)) )
    tmp = fread(paste0("crs_cleanup/",basename(txt)),sep="|")
    data.list[[data.index]] = tmp
    data.index = data.index + 1
  }
  
  crs = do.call(rbind,data.list)
  message("Total CRS rows: ",nrow(crs))
  
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
  
  if(!dir.exists('mirrors')){
    dir.create('mirrors')
  }
  
  fwrite(crs,file = 'mirrors/crs_mirror.csv',append = FALSE);
}

clean_crs_file = function(){
  file_list <- list.files(path = crs_path,pattern = "*.txt",full.names = TRUE,recursive = FALSE);
  
  check_crs_headers(file_list)
  merge_crs_tables(file_list);
}


#This can be done better, read actual files and use ncol before doing processing, that way
#You wont need this method
check_crs_headers = function(file_v){
  
  expected_2016_length <- 86
  
  #Check that the length of the total number of columns match what is expected
  #If column lengths don't match, do a manual visual check to see what has been added or removed
  #All columns need to have the same lenghth for all files of CRS because each change affects all years
  for(fi in file_v){
    
    fo <- file(fi,"r")
    first_line <- readLines(fo,n = 1)
    split_vec <- strsplit(first_line,"|",fixed=TRUE)[[1]]
    
    if((length(split_vec) < expected_2016_length) || (length(split_vec) > expected_2016_length)){
      e <- simpleError(sprintf("Found length %f for file %s but expecting %f ",length(split_vec),fi,expected_2016_length))
      stop(e)
    }
  }
  
 
}


# This function loads the crs mirror to the first available postgre instance in the dev envrioment.
# The assumption is that postgre is running on port 5432 and the executing user has all the relevant privileges to
# created and populate a new database
load_crs_mirror_to_postgres = function(){
  
  
  #Create database oecd_crs_mirror_tmp and create in it schema crs
  setwd('~/git/ddw-r-scripts')
  create_schema_script <- paste0(getwd(),'/shell-scripts/crs-to-postgres/create.crs.schema.and.grant.privilege.to.user.sh')
  system(paste0(create_schema_script,' oecd_crs_mirror'))
  
  
  create_table_script <- paste0(getwd(),'/shell-scripts/crs-to-postgres/create.table.sh')
  system(paste0(create_table_script,' oecd_crs_mirror crs ',release,
                paste0(' ',getwd(),
                       '/shell-scripts/crs-to-postgres/table_template_temporary.txt')))
  
  #populate crs data into mirror database
  copy_data_to_table <- paste0(getwd(),'/shell-scripts/crs-to-postgres/read.in.specific.table.sh')
  system(paste0(copy_data_to_table,' oecd_crs_mirror crs ',release,
                paste0(' ',getwd(),'/shell-scripts/crs-to-postgres/read_in_table_template.txt '),
                paste0(wd,'mirrors/crs_mirror.csv')))
  
  #After loading crs script to DB, need to change column datatypes to the proper datatypes
  
  # #Convert text to timestamp columns
  # char_to_timestamp <- paste0(getwd(),'/shell-scripts/crs-to-postgres/convert.column.type.to.timestamp.sh')
  # system(paste0(char_to_timestamp,' oecd_crs_mirror crs ',release,
  #             paste0(' "',getwd(),'/shell-scripts/crs-to-postgres/column_to_convert_to_timestamp.txt"')))
  
  
  char_to_text <- paste0(getwd(),'/shell-scripts/crs-to-postgres/convert.column.type.to.text.sh')
  system(paste0(char_to_text,' oecd_crs_mirror crs ',release,
                paste0(' "',getwd(),'/shell-scripts/crs-to-postgres/column_to_convert_to_text.txt"')))
  
  char_to_smallint <- paste0(getwd(),'/shell-scripts/crs-to-postgres/convert.column.type.to.smallint.sh')
  system(paste0(char_to_smallint,' oecd_crs_mirror crs ',release,
                paste0(' "',getwd(),'/shell-scripts/crs-to-postgres/column_to_convert_to_smallint.txt"')))
  
  text_to_numeric <- paste0(getwd(),'/shell-scripts/crs-to-postgres/convert.column.type.to.numeric.sh')
  system(paste0(text_to_numeric,' oecd_crs_mirror crs ',release,
                paste0(' "',getwd(),'/shell-scripts/crs-to-postgres/column_to_convert_to_numeric.txt"')))
  
  char_to_int <- paste0(getwd(),'/shell-scripts/crs-to-postgres/convert.column.type.to.int.sh')
  system(paste0(char_to_int,' oecd_crs_mirror crs ',release,
                paste0(' "',getwd(),'/shell-scripts/crs-to-postgres/column_to_convert_to_int.txt"')))
  
  
}

load_dac1_to_postgres <- function(){
  encoding <- 'UTF8'
  max_year <- current_year +1
  mirror_path <- "~/ddw_update/mirrors/dac1.csv"
  
  load_command <- paste0(getwd(),'/shell-scripts/dac1-to-postgres/create.table.table.1.data.sh ',release,' ',encoding,' ',max_year,' ',mirror_path)
  system(load_command)
}

load_dac2a_to_postgres <- function(){
  encoding <- 'LATIN9'
  max_year <- current_year +1
  mirror_path <- "~/ddw_update/mirrors/dac2a.csv"
  load_command <- paste0(getwd(),'/shell-scripts/dac2a-to-postgres/create.table.table.2a.data.sh ',release,' ',encoding,' ',max_year,' ',mirror_path)
  
  system(load_command)
  
}

load_dac2b_to_postgres <- function(){
  encoding <- 'LATIN9'
  max_year <- current_year +1
  mirror_path <- "~/ddw_update/mirrors/dac2b.csv"
  load_command <- paste0(getwd(),'/shell-scripts/dac2b-to-postgres/create.table.table.2b.data.sh ',release,' ',encoding,' ',max_year,' ',mirror_path)
  
  system(load_command)
  
}

load_dac5_to_postgres <- function(){
  encoding <- 'LATIN9'
  max_year <- current_year +1
  mirror_path <- "~/ddw_update/mirrors/dac5.csv"
  load_command <- paste0(getwd(),'/shell-scripts/dac5-to-postgres/create.table.table.5.data.sh ',release,' ',encoding,' ',max_year,' ',mirror_path)
  
  system(load_command)
  
}

clean_crs_file()
load_crs_mirror_to_postgres()

clean_dac2a_file()
load_dac2a_to_postgres()

clean_dac1_file()
load_dac1_to_postgres()

clean_dac2b_file()
load_dac2b_to_postgres()

clean_dac5_file()
load_dac5_to_postgres()