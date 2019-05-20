list.of.packages <- c("data.table","httr","RPostgreSQL","here")
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(list.of.packages, require, character.only=T)

# Only works while running with `Rscript` from repo root, use commented below if running manually
script.dir <- here()
# script.dir = "/src"
# script.dir = "/home/alex/git/ddw-analyst-ui"

source(paste0(script.dir,"/data_updates/R/constants.R"))

isos = read.csv(paste0(script.dir,"/data_updates/manual/CSV/fts_isos.csv"), na.strings="", as.is=T, fileEncoding="utf8")
isos$country_name = NULL
isos$country_code = as.character(isos$country_code)

source_isos = copy(isos)
setnames(source_isos, c("country_code","iso3"), c("source_Location_id","source_iso3"))
dest_isos = copy(isos)
setnames(dest_isos, c("country_code","iso3"), c("destination_Location_id", "destination_iso3"))

merge_isos = function(flow_df){
  if("source_Location_id" %in% names(flow_df)){
    flow_df = merge(flow_df, source_isos, by="source_Location_id", all.x=T)  
  }else{
    flow_df$source_iso3 = NA
  }
  if("destination_Location_id" %in% names(flow_df)){
    flow_df = merge(flow_df, dest_isos, by="destination_Location_id", all.x=T)  
  }else{
    flow_df$destination_iso3 = NA
  }
  return(flow_df)
}

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

table.name = "fts"
table.quote = c("repo",table.name)

single_or_empty_fields = c(
  "id"
  ,"amountUSD"
  ,"budgetYear"
  ,"conributionType"
  ,"createdAt"
  ,"date"
  ,"decisionDate"
  ,"description"
  ,"grandBargainEarmarkingType"
  ,"exchangeRate"
  ,"firstReportedDate"
  ,"flowType"
  ,"newMoney"
  ,"originalAmount"
  ,"originalCurrency"
  ,"method"
  ,"parentFlowId"
  ,"status"
  ,"updatedAt"
  ,"versionId"
  ,"boundary"
  ,"onBoundary"
  ,"refCode"
)

object_fields = c(
  "source"="sourceObjects",
  "destination"="destinationObjects"
)

object_field_cols = c("type","id","name")

other_multi_fields = c("keywords") # TODO: implement if necessary

full.fts.types = c(
  "id"="integer",
  "amountUSD"="integer",
  "budgetYear"="integer",
  "createdAt"="text",
  "date"="text",
  "decisionDate"="text",
  "description"="text",
  "firstReportedDate"="text",
  "flowType"="text",
  "newMoney"="bool",
  "originalCurrency"="text",
  "method"="text",
  "parentFlowId"="integer",
  "status"="text",
  "updatedAt"="text",
  "versionId"="integer",
  "boundary"="text",
  "onBoundary"="text",
  "source_Organization_id"="integer",
  "source_UsageYear_id"="text",
  "source_Organization_name"="text",
  "source_UsageYear_name"="text",
  "destination_Plan_id"="text",
  "destination_Organization_id"="text",
  "destination_GlobalCluster_id"="text",
  "destination_Location_id"="text",
  "destination_iso3"="text",
  "destination_Project_id"="integer",
  "destination_UsageYear_id"="text",
  "destination_Plan_name"="text",
  "destination_Organization_name"="text",
  "destination_GlobalCluster_name"="text",
  "destination_Location_name"="text",
  "destination_Project_name"="text",
  "destination_UsageYear_name"="text",
  "report_type"="text",
  "report_organisation"="text",
  "report_channel"="text",
  "report_date"="text",
  "originalAmount"="float8",
  "source_Location_id"="text",
  "source_iso3"="text",
  "source_Location_name"="text",
  "destination_Emergency_id"="integer",
  "destination_Emergency_name"="text",
  "refCode"="text",
  "source_GlobalCluster_id"="text",
  "source_GlobalCluster_name"="text",
  "exchangeRate"="float8",
  "source_Plan_id"="text",
  "source_Plan_name"="text",
  "grandBargainEarmarkingType"="text",
  "source_Emergency_id"="integer",
  "source_Emergency_name"="text",
  "source_Project_id"="integer",
  "source_Project_name"="text",
  "destination_Cluster_id"="text",
  "destination_Cluster_name"="text",
  "source_Cluster_id"="text",
  "source_Cluster_name"="text"
)

flatten_flow = function(single_flow){
  flat_flow = data.frame(t(unlist(single_flow[single_or_empty_fields])),stringsAsFactors=F)
  
  for(i in 1:length(object_fields)){
    field_list = single_flow[object_fields[i]][[1]]
    if(length(field_list)>0){
      field_df = data.table(t(sapply(field_list,`[`,object_field_cols)))
      field_df$type = sapply(field_df$type,`[`,1)
      field_df_grouped = field_df[,.(id=paste(id,collapse=" | "),name=paste(name,collapse=" | ")),by=.(type)]
      field_prefix = names(object_fields)[i]
      flat_flow[,paste(field_prefix,field_df_grouped$type,"id",sep="_")] = field_df_grouped$id
      flat_flow[,paste(field_prefix,field_df_grouped$type,"name",sep="_")] = field_df_grouped$name
    }
  }
  
  flat_flow["report_type"] = single_flow$reportDetails[[1]]$sourceType
  flat_flow["report_organisation"] = single_flow$reportDetails[[1]]$organization
  flat_flow["report_channel"] = single_flow$reportDetails[[1]]$reportChannel
  flat_flow["report_date"] = single_flow$reportDetails[[1]]$date
  
  return(flat_flow)
}

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
    flow_df_name_diff = setdiff(names(full.fts.types), names(flow_df))
    for(name_diff in flow_df_name_diff){
      flow_df[,name_diff]=NA
    }
    dbWriteTable(con, name = table.quote, value = flow_df, row.names = F, overwrite = new_table, append = !new_table, field.types=full.fts.types)
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
        flow_df_name_diff = setdiff(names(full.fts.types), names(flow_df))
        for(name_diff in flow_df_name_diff){
          flow_df[,name_diff]=NA
        }
        dbWriteTable(con, name = table.quote, value = flow_df, row.names = F, overwrite = FALSE, append = TRUE, field.types=full.fts.types)
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

pb = txtProgressBar(min=2000, max=2022, style=3)
new_table = TRUE
for(i in 2000:2022){
  setTxtProgressBar(pb, i)
  b = paste0("year=",i)
  fts.flow(boundary=b,auth=auth, con, table.quote, new_table)
  new_table = FALSE
}
close(pb)
dbDisconnect(con)

