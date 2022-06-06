list.of.packages <- c("data.table","httr","RPostgreSQL","here","utils","rvest","stringr","reshape")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages, repos="http://cran.us.r-project.org")
lapply(list.of.packages, require, character.only=T)

#### Read-in and manipulation ####

# Only works while running with `Rscript` from repo root, use commented below if running manually
# script.dir <- here()
script.dir = "C:/git/ddw-analyst-ui"

source(paste0(script.dir,"/data_updates/R/constants.R"))

session <- tempdir()

data <- download.file("https://unstats.un.org/sdgs/indicators/database/archive/2022_Q1.3_AllData_Before_20220412_CSV.zip",file.path(session,"dat.zip"),mode="wb")

data <- unzip(file.path(session,"dat.zip"),exdir = file.path(session,"dat.csv"))

data <- read.csv(data)

# Filter on year

data <- subset(data,data$TimePeriod>=2015)

# Mapping from countries

countries <- read_html("https://unstats.un.org/unsd/methodology/m49/overview/#")

countries <- html_table(countries)[[1]]

countries = countries[-c(1),]

countries$X10 = as.numeric(countries$X10)

data <- merge(data,countries[,c("X10","X12")],by.y = "X10", by.x = "GeoAreaCode", all.x=T)
data$X12[which(data$GeoAreaName=="Kosovo")] = "XKX"

#### Some checks that can be commented out when running automatically ####

# table(data$X12, useNA = "always")
# checks <- subset(data,is.na(data$X12)) # checks is 181851 before i do anything numeric, 100191 after.
# table(checks$GeoAreaCode, useNA = "always")
# 
# 
# regional_ids <- c(unique(countries$X1),unique(countries$X3),unique(countries$X5),unique(countries$X7))
# regional_ids <- as.numeric(regional_ids[which(regional_ids!="")])
# remaining <- setdiff(unique(checks$GeoAreaCode), regional_ids)
# 
# checks <- subset(checks,checks$GeoAreaCode %in% remaining) # checks is only 31437 after accounting for the regional options.
# unique(checks$GeoAreaName)

#### Continue manipulation ####

# Clean up

data$X <- NULL
names(data)[which(names(data) == "X12")] <- "iso3"

data = transform(data, Holding = colsplit(Indicator, split = "\\.", names = c('a','b','c')))
data$Holding.a <- NULL
names(data)[which(names(data) == "Holding.b")] <- "TargetLevel"
names(data)[which(names(data) == "Holding.c")] <- "IndicatorLevel"

# map 1-20 as A-T and then a-f as u-Z. Do this for Goal, TargetLevel, IndicatorLevel. It can then be sorted easily.

data$Goal_letter <- letters[data$Goal]

map<-data.frame(letters,as.character(1:26))
names(map)<-c("letters","numbers")
let2nums <- function(string){
  returnme <- as.character(map$numbers[map$letters==string])
  returnme = as.numeric(returnme) + 20
  return(returnme)
}

data$Target_letter <- letters[as.numeric(data$TargetLevel)]
data$Target_letter[which(is.na(data$Target_letter))] <- letters[unlist(lapply(data$TargetLevel[which(is.na(data$Target_letter))],let2nums))]

data$Indicator_letter <- letters[as.numeric(data$IndicatorLevel)]
data$Indicator_letter[which(is.na(data$Indicator_letter))] <- letters[unlist(lapply(data$IndicatorLevel[which(is.na(data$Indicator_letter))],let2nums))]

data$sort = paste0(data$Goal_letter,data$Target_letter,data$Indicator_letter)
data$Goal_letter = NULL
data$Target_letter = NULL
data$Indicator_letter = NULL

#### Database ####

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

table.name = "sdg"
table.quote = c("repo",table.name)

raw.sdg.types = c(
  "GeoAreaCode"="integer",
  "ID"="integer",
  "Goal"="integer",
  "Target"="text",
  "Indicator"="text",
  "ReleaseStatus"="text",
  "ReleaseName"="text",
  "SeriesID"="integer",
  "SeriesCode"="text",
  "isDSDSeries"="bool",
  "SeriesDescription"="text",
  "SeriesObservationCount"="integer",
  "GeoAreaName"="text",
  "TimePeriod"="integer",
  "Value"="text", # this is a character initially.
  # There are some with ValueType string below.
  "ValueType"="text",
  "Time_Detail"="text",
  "TimeCoverage"="text", # All NA.
  "UpperBound"="numeric",
  "LowerBound"="numeric",
  "BasePeriod"="integer",
  "Source"="text",
  "GeoInfoUrl"="text", # All NA.
  "FootNote"="text",
  "ObservationID"="integer",
  "Age"="text", # Uses character fields in age?
  "Freq"="text", # All NA.
  "Location"="text",
  "Nature"="text",
  "Sex"="text",
  "UnitMultiplier"="text", # All NA
  "Units"="text",
  "Level.Status"="text", 
  "Name.of.international.agreement"="text", # All NA.
  "Education.level"="text",
  "Type.of.product"="text",
  "Type.of.facilities"="text", # All NA.
  "Name.of.international.institution"="text",
  "Type.of.occupation"="text",
  "Tariff.regime..status."="text", #All NA.
  "Type.of.skill"="text",
  "Mode.of.transportation"="text",
  "Type.of.mobile.technology"="text", # All NA.
  "Name.of.non.communicable.disease"="text",
  "Type.of.speed"="text",
  "Migratory.status"="text",
  "Disability.status"="text",
  "Hazard.type"="text", # All NA.
  "IHR.Capacity"="text",
  "Cities"="text",
  "Reporting.Type"="text",
  "Quantile"="text",
  "Activity"="text",
  "Observation.Status"="text",
  "Policy.Domains"="text",
  "Policy.instruments"="text",
  "Sampling.Stations"="text",
  "Type.of.waste.treatment"="text",
  "Grounds.of.discrimination"="text",
  "Parliamentary.committees"="text",
  "Cause.of.death"="text",
  "Substance.use.disorders"="text",
  "Mountain.Elevation"="text", # 1-6 then "ALL".
  "Deviation.Level"="text",
  "Frequency.of.Chlorophyll.a.concentration"="text",
  "Food.Waste.Sector"="text",
  "Fiscal.intervention.stage"="text",
  "Level.of.requirement"="text",
  "Type.of.support"="text",
  "Report.Ordinal"="text",
  "Counterpart"="text",
  "Government_Name"="integer",
  "Severity.of.price.levels"="text",
  "Level_of_government"="text",
  "Type.of.renewable.technology"="text",
  "Population.Group"="text",
  "iso3"="text",
  "TargetLevel"="text",
  "IndicatorLevel"="integer"
)

fts.flow = function(boundary=NULL,auth=NULL, con, table.quote, new_table){
  page = 1
  base.url = paste0("https://api.hpc.tools/v1/public/fts/flow?",boundary)
  if(is.null(boundary)){
    stop("Boundary is a required field.")
  }
  if(!is.null(auth)){
    res = GET(
      base.url
      ,authenticate(auth$user, auth$pass)
    )
  }else{
    res = GET(base.url)
  }
  if(res$status_code==200){
    dat = content(res)
    rm(res)
    flows = dat$data$flows
    flow_df = rbindlist(lapply(flows,flatten_flow),fill=T)
    flow_df = merge_isos(flow_df)
    flow_df_name_diff = setdiff(names(raw.fts.types), names(flow_df))
    for(name_diff in flow_df_name_diff){
      flow_df[,name_diff]=NA
    }
    flow_df = flow_df[,keep.columns,with=F]
    names(flow_df)[which(names(flow_df) %in% names(name.remapping))] = name.remapping[names(flow_df)[which(names(flow_df) %in% names(name.remapping))]]
    dbWriteTable(con, name = table.quote, value = flow_df, row.names = F, overwrite = new_table, append = !new_table, field.types=keep.fts.types)
    while("nextLink" %in% names(dat$meta)){
      page = page + 1
      if(!is.null(auth)){
        res = GET(
          dat$meta$nextLink
          ,authenticate(auth$user, auth$pass)
        )
      }else{
        res = GET(dat$meta$nextLink)
      }
      if(res$status_code==200){
        dat = content(res)
        rm(res)
        flows = dat$data$flows
        flow_df = rbindlist(lapply(flows,flatten_flow),fill=T)
        flow_df = merge_isos(flow_df)
        flow_df_name_diff = setdiff(names(raw.fts.types), names(flow_df))
        for(name_diff in flow_df_name_diff){
          flow_df[,name_diff]=NA
        }
        flow_df = flow_df[,keep.columns,with=F]
        names(flow_df)[which(names(flow_df) %in% names(name.remapping))] = name.remapping[names(flow_df)[which(names(flow_df) %in% names(name.remapping))]]
        dbWriteTable(con, name = table.quote, value = flow_df, row.names = F, overwrite = FALSE, append = TRUE, field.types=keep.fts.types)
      }
    }
    return(TRUE)
  }else{
    stop("HTTP error: ",res$status_code)
  }
}

args = commandArgs(trailingOnly=TRUE)
if(length(args)==0){
  auth=NULL
  warning("Running without authentication")
}else{
  auth = list("user"=args[1],"pass"=args[2])
}

new_table = TRUE
years = c(2000:2030)
b = paste0("year=",paste(years,collapse="%2C"))
fts.flow(boundary=b, auth=auth, con, table.quote, new_table)

dbDisconnect(con)

