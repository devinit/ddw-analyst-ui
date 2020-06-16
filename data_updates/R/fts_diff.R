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

data$lower.Donor <- lowerConv(data$Donor)
lower.Donor = unique(data[,c("Donor","lower.Donor"),drop=F])

data$lower.Recipient.Organization <- lowerConv(data$Recipient.Organization)
lower.Recipient.Organization = unique(data[,c("Recipient.Organization","lower.Recipient.Organization"),drop=F])

data$lower.Destination.Country <- lowerConv(data$Destination.Country)
lower.Destination.Country = unique(data[,c("Destination.Country","lower.Destination.Country"),drop=F])

data$destinationcountrytype <- paste(data$destinationcountryid,data$source_UsageYear_name)
data$destinationcountrytype[is.na(data$destinationcountrytype)] <- FALSE
data$lower.destinationcountrytype <- lowerConv(data$destinationcountrytype)
lower.destinationcountrytype = unique(data[,c("destinationcountrytype","lower.destinationcountrytype"),drop=F])

data$deflatortype <- paste(data$donorcountryid,data$source_UsageYear_name)
data$deflatortype[is.na(data$deflatortype)] <- FALSE
deflatortype = unique(data[,c("deflatortype"),drop=F])

#Merge to create new column "Code name" based on donor name
codename <- dbReadTable(con, c("repo","fts_codenames"))
codename$lower.Donor <- lowerConv(codename$Donor)
codename <- codename[!duplicated(codename$Donor),]
codename <- join(codename, lower.Donor, by='lower.Donor', type='full', match='first')
codename$lower.Donor = NULL
dbWriteTable(con, name = c("repo","fts_codenames"), value = codename, row.names = F, overwrite = T)

#Merge to create new column "Private money" based on donor name
privatemoney <- dbReadTable(con, c("repo", "fts_privatemoney"))
privatemoney$lower.Donor <- lowerConv(privatemoney$Donor)
privatemoney <- privatemoney[!duplicated(privatemoney$Donor),]
privatemoney <- join(privatemoney, lower.Donor, by='lower.Donor', type='full', match='first')
privatemoney$lower.Donor = NULL
dbWriteTable(con, name = c("repo","fts_privatemoney"), value = privatemoney, row.names = F, overwrite = T)

#Merge to create new column "Donor DAC region" based on donor name
donordacregion <- dbReadTable(con, c("repo", "fts_dacregion"))
donordacregion$lower.Donor <- lowerConv(donordacregion$Donor)
donordacregion <- donordacregion[!duplicated(donordacregion$Donor),]
donordacregion <- join(donordacregion, lower.Donor, by='lower.Donor', type='full', match='first')
donordacregion$lower.Donor = NULL
dbWriteTable(con, name = c("repo","fts_dacregion"), value = donordacregion, row.names = F, overwrite = T)

#Merge to create new column "Donor Country ID" based on donor name
donorscountryid <- dbReadTable(con, c("repo", "fts_donorscountryid"))
donorscountryid$lower.Donor <- lowerConv(donorscountryid$Donor)
donorscountryid <- donorscountryid[!duplicated(donorscountryid$Donor),]
donorscountryid <- join(donorscountryid, lower.Donor, by='lower.Donor', type='full', match='first')
donorscountryid$lower.Donor = NULL
dbWriteTable(con, name = c("repo","fts_donorscountryid"), value = donorscountryid, row.names = F, overwrite = T)

#Merge to create new column "Appealing agency code name" based on recipient organisation name
recipientcodename <- dbReadTable(con, c("repo", "fts_recipientcodename"))
recipientcodename$lower.Recipient.Organization <- lowerConv(recipientcodename$Recipient.Organization)
recipientcodename <- recipientcodename[!duplicated(recipientcodename$Recipient.Organization),]
recipientcodename <- join(recipientcodename, lower.Recipient.Organization, by='lower.Recipient.Organization', type='full', match='first')
recipientcodename$lower.Recipient.Organization = NULL
dbWriteTable(con, name = c("repo","fts_recipientcodename"), value = recipientcodename, row.names = F, overwrite = T)

#Merge to create new column "Recip Org NGO type" based on recipient organisation name
ngotype <- dbReadTable(con, c("repo", "fts_ngotype"))
ngotype$lower.Recipient.Organization <- lowerConv(ngotype$Recipient.Organization)
ngotype <- ngotype[!duplicated(ngotype$Recipient.Organization),]
ngotype <- join(ngotype, lower.Recipient.Organization, by='lower.Recipient.Organization', type='full', match='first')
ngotype$lower.Recipient.Organization = NULL
dbWriteTable(con, name = c("repo","fts_ngotype"), value = ngotype, row.names = F, overwrite = T)

#Merge to create new column "Channels of delivery" based on recipient organisation name
deliverychannels <- dbReadTable(con, c("repo", "fts_deliverychannels"))
deliverychannels$lower.Recipient.Organization <- lowerConv(deliverychannels$Recipient.Organization)
deliverychannels <- deliverychannels[!duplicated(deliverychannels$Recipient.Organization),]
deliverychannels <- join(deliverychannels, lower.Recipient.Organization, by='lower.Recipient.Organization', type='full', match='first')
deliverychannels$lower.Recipient.Organization = NULL
dbWriteTable(con, name = c("repo","fts_deliverychannels"), value = deliverychannels, row.names = F, overwrite = T)

#Merge to create new column "Recipient country ID" based on recipient organisation name
recipientcountryid <- dbReadTable(con, c("repo", "fts_recipientcountryid"))
recipientcountryid$lower.Recipient.Organization <- lowerConv(recipientcountryid$Recipient.Organization)
recipientcountryid <- recipientcountryid[!duplicated(recipientcountryid$Recipient.Organization),]
recipientcountryid <- join(recipientcountryid, lower.Recipient.Organization, by='lower.Recipient.Organization', type='full', match='first')
recipientcountryid$lower.Recipient.Organization = NULL
dbWriteTable(con, name = c("repo","fts_recipientcountryid"), value = recipientcountryid, row.names = F, overwrite = T)

#Merge to create new column "ODA eligible" based on destination country
odaeligible <- dbReadTable(con, c("repo", "fts_odaeligible"))
odaeligible$lower.Destination.Country <- lowerConv(odaeligible$Destination.Country)
odaeligible <- odaeligible[!duplicated(odaeligible$Destination.Country),]
odaeligible <- join(odaeligible, lower.Destination.Country, by='lower.Destination.Country', type='full', match='all')
odaeligible$lower.Destination.Country = NULL
dbWriteTable(con, name = c("repo","fts_odaeligible"), value = odaeligible, row.names = F, overwrite = T)

#Merge to create new column "Destination country ID" based on destination country
destinationcountryid <- dbReadTable(con, c("repo", "fts_destinationcountryid"))
destinationcountryid$lower.Destination.Country <- lowerConv(destinationcountryid$Destination.Country)
destinationcountryid <- destinationcountryid[!duplicated(destinationcountryid$Destination.Country),]
destinationcountryid <- join(destinationcountryid, lower.Destination.Country, by='lower.Destination.Country', type='full', match='all')
destinationcountryid$lower.Destination.Country = NULL
dbWriteTable(con, name = c("repo","fts_destinationcountryid"), value = destinationcountryid, row.names = F, overwrite = T)


#Merge to create new column "Income group" based on destination country
incomegroups <- dbReadTable(con, c("repo", "fts_incomegroups"))
incomegroups$lower.destinationcountrytype <- lowerConv(incomegroups$destinationcountrytype)
incomegroups <- incomegroups[!duplicated(incomegroups$destinationcountrytype),]
incomegroups <- join(incomegroups, lower.destinationcountrytype, by='lower.destinationcountrytype', type='full', match='all')
incomegroups$lower.destinationcountrytype = NULL
dbWriteTable(con, name = c("repo","fts_incomegroups"), value = incomegroups, row.names = F, overwrite = T)

#Merge to create new column "Deflator" based on Deflator type
deflators <- dbReadTable(con, c("repo", "fts_deflators"))
deflators <- join(deflators, deflatortype, by='deflatortype', type='full', match='all')
dbWriteTable(con, name = c("repo","fts_deflators"), value = deflators, row.names = F, overwrite = T)

dbDisconnect(con)

