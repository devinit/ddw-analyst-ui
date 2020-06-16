list.of.packages <- c("data.table","httr","RPostgreSQL","here","plyr")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here::here()
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

lowerConv <- function(x){
  return(tolower(iconv(x,"latin1","latin1")))
}

source.table.name = "fts"
source.table.quote = c("repo",source.table.name)

destination.table.name = "fts_precoded"
destination.table.quote = c("repo",destination.table.name)

data = dbReadTable(con,source.table.quote)

#removing FTS flow status pledge
data <- subset(data, data$status %in% c('paid','commitment'))

# Remove government of
data$Donor <- gsub(", Government of","",data$Donor)
data$Recipient.Organization <- gsub(", Government of","",data$Recipient.Organization)

#Replace with special characters
character_replacements = list(
  c("Ã¡","á"), c("Ã¢","â"), c("Ã¤","ä"),
  c("Ã©","é"), c("Ã«","ë"), c("Ã³","ó"),
  c("Ã´","ô"), c("Ã¶","ö"), c("Ãº","ú"),
  c("Ã¼","ü"), c("Äf","ã"), c("ÄT","ê"),
  c('Å"','ñ'), c("Å^","ò"), c("Å'","õ"),
  c("Å.","à"), c("Å>","o"), c("Å¯","ù"),
  c("Å±","û"), c("Ã¨","è"), c("Ã§","ç"),
  c("Ã¸","ø"), c('â???"','-'), c("â???T","’"),
  c("Ã®","î"), c("Ã±","ñ"), c("Ãª","ê"),
  c("Ã???","Ç"), c("Ã®","î"), c("Ã±","ñ"),
  c('â???"','-'), c('Ã"','Ä'),
  c("Ã","í"), c("Ã¯","ï"), c("í£","ã"),
  c("í¯","ï"), c("í¦","æ"), c("í¥","å"),
  c("â???T","'"),c('â???"',"-"), c("í¦","à"),
  c('Å"',"o"), c("Å,","à"), c('Å"',"à"),
  c('â???"','-'),c("â???T","'"),c('â???"',"-"),
  c('â???T',"'"), c('Å"',"à"), c('â€“',"-"),
  c('â€™',"’")
)

for(character_replacement in character_replacements){
  from_character = character_replacement[1]
  to_character = character_replacement[2]
  data$Donor <- gsub(
    from_character,
    to_character,
    data$Donor,
    ignore.case = FALSE, perl = FALSE,
    fixed = TRUE, useBytes = FALSE
  )
  data$Recipient.Organization <- gsub(
    from_character,
    to_character,
    data$Recipient.Organization,
    ignore.case = FALSE, perl = FALSE,
    fixed = TRUE, useBytes = FALSE
  )
}

#Merge to create new column "Code name" based on donor name
codename <- dbReadTable(con, c("repo","fts_codenames"))
codename$lower.Donor <- lowerConv(codename$Donor)
codename <- codename[!duplicated(codename$Donor),]
codename$Donor <- NULL
data$lower.Donor <- lowerConv(data$Donor)
data$lower.Recipient.Organization <- lowerConv(data$Recipient.Organization)

data <- join(data, codename, by='lower.Donor', type='left', match='first')

#Merge to create new column "Private money" based on donor name

privatemoney <- dbReadTable(con, c("repo", "fts_privatemoney"))
privatemoney$lower.Donor <- lowerConv(privatemoney$Donor)
privatemoney <- privatemoney[!duplicated(privatemoney$Donor),]
privatemoney$Donor <- NULL
data <- join(data, privatemoney, by='lower.Donor', type='left', match='first')

#Merge to create new column "Donor DAC region" based on donor name
donordacregion <- dbReadTable(con, c("repo", "fts_dacregion"))
donordacregion$lower.Donor <- lowerConv(donordacregion$Donor)
donordacregion <- donordacregion[!duplicated(donordacregion$Donor),]
donordacregion$Donor <- NULL
data <- join(data, donordacregion, by='lower.Donor', type='left', match='first')

#Merge to create new column "Donor Country ID" based on donor name
donorscountryid <- dbReadTable(con, c("repo", "fts_donorscountryid"))
donorscountryid$lower.Donor <- lowerConv(donorscountryid$Donor)
donorscountryid <- donorscountryid[!duplicated(donorscountryid$Donor),]
donorscountryid$Donor <- NULL
data <- join(data, donorscountryid, by='lower.Donor', type='left', match='first')

#Merge to create new column "Appealing agency code name" based on recipient organisation name
recipientcodename <- dbReadTable(con, c("repo", "fts_recipientcodename"))
recipientcodename$lower.Recipient.Organization <- lowerConv(recipientcodename$Recipient.Organization)
recipientcodename <- recipientcodename[!duplicated(recipientcodename$Recipient.Organization),]
recipientcodename$Recipient.Organization <- NULL 
data <- join(data, recipientcodename, by='lower.Recipient.Organization', type='left', match='first')

#Merge to create new column "Recip Org NGO type" based on recipient organisation name
ngotype <- dbReadTable(con, c("repo", "fts_ngotype"))
ngotype$lower.Recipient.Organization <- lowerConv(ngotype$Recipient.Organization)
ngotype <- ngotype[!duplicated(ngotype$Recipient.Organization),]
ngotype$Recipient.Organization <- NULL
data <- join(data, ngotype, by='lower.Recipient.Organization', type='left', match='first')

#Merge to create new column "Channels of delivery" based on recipient organisation name
deliverychannels <- dbReadTable(con, c("repo", "fts_deliverychannels"))
deliverychannels$lower.Recipient.Organization <- lowerConv(deliverychannels$Recipient.Organization)
deliverychannels <- deliverychannels[!duplicated(deliverychannels$Recipient.Organization),]
deliverychannels$Recipient.Organization <- NULL
data <- join(data, deliverychannels, by='lower.Recipient.Organization', type='left', match='first')

#Merge to create new column "Recipient country ID" based on recipient organisation name
recipientcountryid <- dbReadTable(con, c("repo", "fts_recipientcountryid"))
recipientcountryid$lower.Recipient.Organization <- lowerConv(recipientcountryid$Recipient.Organization)
recipientcountryid <- recipientcountryid[!duplicated(recipientcountryid$Recipient.Organization),]
recipientcountryid$Recipient.Organization <- NULL
data <- join(data, recipientcountryid, by='lower.Recipient.Organization', type='left', match='first')

#Merge to create new column "ODA eligible" based on destination country
odaeligible <- dbReadTable(con, c("repo", "fts_odaeligible"))
data$lower.Destination.Country <- lowerConv(data$Destination.Country)
odaeligible$lower.Destination.Country <- lowerConv(odaeligible$Destination.Country)
odaeligible <- odaeligible[!duplicated(odaeligible$Destination.Country),]
odaeligible$Destination.Country <- NULL 
data <- join(data, odaeligible, by='lower.Destination.Country', type='left', match='all')

#Merge to create new column "Destination country ID" based on destination country
destinationcountryid <- dbReadTable(con, c("repo", "fts_destinationcountryid"))
destinationcountryid$lower.Destination.Country <- lowerConv(destinationcountryid$Destination.Country)
destinationcountryid <- destinationcountryid[!duplicated(destinationcountryid$Destination.Country),]
destinationcountryid$Destination.Country <- NULL 
data <- join(data, destinationcountryid, by='lower.Destination.Country', type='left', match='all')

#Create new column "Destination country type"
data$destinationcountrytype <- paste(data$destinationcountryid,data$source_UsageYear_name)
data$destinationcountrytype[is.na(data$destinationcountrytype)] <- FALSE

#Merge to create new column "Income group" based on destination country
incomegroups <- dbReadTable(con, c("repo", "fts_incomegroups"))
data$lower.destinationcountrytype <- lowerConv(data$destinationcountrytype)
incomegroups$lower.destinationcountrytype <- lowerConv(incomegroups$destinationcountrytype)
incomegroups <- incomegroups[!duplicated(incomegroups$destinationcountrytype),]
incomegroups$destinationcountrytype <- NULL 
data <- join(data, incomegroups, by='lower.destinationcountrytype', type='left', match='all')

#Create new column "Domestic" 
data$domesticresponse <- ifelse(data$donorcountryid==data$destinationcountryid,TRUE,FALSE)
data$domesticresponse[is.na(data$domesticresponse)] <- FALSE

#Create new column "Deflator type"
data$deflatortype <- paste(data$donorcountryid,data$source_UsageYear_name)
data$deflatortype[is.na(data$deflatortype)] <- FALSE

#Merge to create new column "Deflator" based on Deflator type
deflators <- dbReadTable(con, c("repo", "fts_deflators"))
data <- join(data, deflators, by='deflatortype', type='left', match='all')
data <- transform(data,amountDeflated=as.numeric(amountUSD)/as.numeric(Deflators))
data <- transform(data,amountDeflatedMillions=amountDeflated/1000000)

#Remove deflatortype column
data$deflatortype <- NULL

#Remove destinationcountrytype column
data$lower.destinationcountrytype <- NULL
data$destinationcountrytype <- NULL

#Remove lower.deflatortype column
data$lower.deflatortype <- NULL

#Remove lower.Donor column
data$lower.Donor <- NULL

#Remove lower.recipient column
data$lower.Recipient.Organization <- NULL

#Remove lower.Destination.Country column
data$lower.Destination.Country <- NULL

coded.fts.types = c(
  "id"="integer",
  "amountUSD"="integer",
  "budgetYear"="integer",
  "description"="text",
  "flowType"="text",
  "newMoney"="bool",
  "originalAmount"="float8",
  "originalCurrency"="text",
  "method"="text",
  "status"="text",
  "boundary"="text",
  "onBoundary"="text",
  "Donor"="text",
  "source_Location_name"="text",
  "source_iso3"="text",
  "source_UsageYear_name"="text",
  "Recipient.Organization"="text",
  "destination_GlobalCluster_name"="text",
  "Destination.Country"="text",
  "destination_iso3"="text",
  "destination_UsageYear_name"="text",
  "destination_Plan_name"="text",
  "destination_Project_name"="text",
  "parentFlowId"="integer",
  "grandBargainEarmarkingType"="text",
  "source_Plan_id"="text",
  "source_Plan_name"="text",
  "destination_Cluster_name"="text",
  "destination_Emergency_name"="text",
  "exchangeRate"="float8",
  "source_Emergency_name"="text",
  "source_GlobalCluster_name"="text",
  "codename"="text",
  "privatemoney"="text",
  "Region"="text",
  "donorcountryid"="text",
  "recipientcodename"="text",
  "ngotype"="text",
  "deliverychannels"="text",
  "recipientcountryid"="text",
  "odaeligible"="text",
  "destinationcountryid"="text",
  "incomegroups"="text",
  "domesticresponse"="bool",
  "Deflators"="float8",
  "amountDeflated"="float8",
  "amountDeflatedMillions"="float8"
)

dbWriteTable(con, name = destination.table.quote, value = data, row.names = F, overwrite = T, field.types=coded.fts.types)

dbDisconnect(con)

