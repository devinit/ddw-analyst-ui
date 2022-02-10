####Setup###/#
list.of.packages <- c("reshape2","data.table","openxlsx","plyr","gdata","varhandle","rsdmx","rstudioapi","RCurl","git2rdata")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

wd <- dirname(getActiveDocumentContext()$path)
setwd(wd)

#bring in data
options(timeout = 1000)
temp <- tempfile()
download.file("https://ddw.devinit.org/api/export/1231",temp,method = "libcurl")
dat <- fread(temp)
names(dat) = c("year","Reporting Organisation Narrative","aid_type_di_name","Sector Code - Calculated", "DAC3 Sector Code - Calculated","Reporting Organisation Type Code","Reporting Organisation Type Name - Calculated","Recipient Code","Recipient Name","Flow Type Code - Calculated","Transaction Receiver Organisation Type","Transaction Type","x_transaction_value_usd_m_Sum")
dat <- dat[!(dat$`Sector Code - Calculated` == 13010 |dat$`Sector Code - Calculated` == 13081),]

#Add necessary Columns
dat <- mutate(dat, purpose_name = ifelse(`Sector Code - Calculated` == 13030, "Family planning", ifelse(`Sector Code - Calculated` == 13020, "Reproductive health care", "NA")))
dat <- mutate(dat, `Channel of delivery` = ifelse(`Transaction Receiver Organisation Type` == 21, "NGOs and Civil Society", ifelse(`Transaction Receiver Organisation Type` == 40, "Multilateral", ifelse(`Transaction Receiver Organisation Type` == 10, "Public Sector", ifelse(`Transaction Receiver Organisation Type` == 70, "Private Sector", ifelse(`Transaction Receiver Organisation Type` == 80, "Universities and Research Institutes", ifelse(`Transaction Receiver Organisation Type` == 22,"NGOs and Civil Society", ifelse(`Transaction Receiver Organisation Type` == 90, "Other",ifelse(`Transaction Receiver Organisation Type` == 73, "Private Sector", ifelse(`Transaction Receiver Organisation Type` ==23, "NGOs and Cvil Society", ifelse(`Transaction Receiver Organisation Type` == 24, "NGOs and Civil Society","Not Reported")))))))))))

#Get transactions in correct units
dat$x_transaction_value_usd_m_Sum <- dat$x_transaction_value_usd_m_Sum/1000000

repo <- repository("C:/git/di-website-data")
pull(repo)
write_vc(dat, file = "2022/iati_rhfp.csv", root = repo, stage = TRUE)
commit(repo, "Update of the RHFP data for Gates")
push(repo)
