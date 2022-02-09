####Setup###/#
list.of.packages <- c("reshape2","data.table","openxlsx","plyr","gdata","varhandle","rsdmx","rstudioapi","RCurl")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

setwd(dirname(getActiveDocumentContext()$path))

# bring in data
options(timeout = 1000)
temp <- tempfile()
download.file("https://ddw.devinit.org/api/export/1271",temp,method = "libcurl")
dat <- fread(temp)
names(dat) = c("Code type","Year","recipient_name","Reporting Organisation Narrative", "disbursed")

#replace sector code with sector name
dat$'Code type'[which(dat$`Code type`==13020)] = "Reproductive health care"
dat$'Code type'[which(dat$`Code type`==13030)] = "Family planning"

#create 13020 + 13030
AggData = aggregate(dat$disbursed, by=list(dat$`Reporting Organisation Narrative`,dat$recipient_name,dat$Year), FUN=sum)
names(AggData) = c("Reporting Organisation Narrative","recipient_name","Year","disbursed")
AggData$'Code type'<- "Reproductive health care and family planning"

#combine dataframes
dat3 = rbind(AggData,dat)

#Change to wide format
datwide = dcast(dat3, `Code type` + `Reporting Organisation Narrative` + `recipient_name` ~ `Year`,value.var="disbursed") 

write.csv(datwide,"iati_rhfp2.csv")
