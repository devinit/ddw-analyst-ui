
insert into core_source
(indicator,indicator_acronym,source,source_acronym,source_url,download_path,storage_type,schema,active_mirror_name,description,last_updated_on,created_on)
values
('Common Reporting Standard','crs','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','public','crs_current','Data about flows of resources',now(),now()),
('Official Development Assistance 1','dac1','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','public','dac1_current','Data about flows of resources',now(),now()),
('Official Development Assistance2','dac2','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','public','dac2a_current','Data about flows of resources',now(),now()),
('Official Development Assistance 2b','dac2b','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','public','dac2b_current','Data about flows of resources',now(),now()),
('Official Development Assistance 5','dac5','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','public','dac5_current','Data about flows of resources',now(),now()),
('World Bank Indicators','WDI','World Bank Group','WBG','http://wdi.worldbank.org','http://wdi.worldbank.org/tables','schema','public','wdi','Data about flows of resources',now(),now());


insert into core_updatehistory (source_id,history_table,released_on,release_description,created_on,updated_on)
values
(1,'crs_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),now()),
(1,'crs_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now(),now()),
(2,'dac1_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),now()),
(2,'dac1_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now(),now()),
(3,'dac2_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),now()),
(3,'dac2_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now(),now()),
(3,'dac2b_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),now()),
(3,'dac2b_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now(),now()),
(4,'dac2b_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),now()),
(4,'dac2b_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now(),now());




insert into core_sourcecolumnmap (data_type, source_id,name,source_name,description,created_on,updated_on)
VALUES
('N',1,'year','Year','Reporting year',now(),now()),
('N',1,'donor_code','DonorCode','Reporting country/organisation',now(),now()),
('C',1,'donor_name','DonorName','Reporting country/organisation',now(),now()),
('N',1,'agency_code','AgencyCode','Extending agency',now(),now()),
('C',1,'agency_name','AgencyName','Extending agency',now(),now()),
('C',1,'crs_id','CRSid','CRS Identification number',now(),now()),
('C',1,'project_number','ProjectNumber','Donor project number',now(),now()),
('C',1,'initial_report','InitialReport','Nature of submission',now(),now()),
('N',1,'recipient_code','RecipientCode','Recipient',now(),now()),
('C',1,'recipient_name','RecipientName','Recipient',now(),now()),
('N',1,'region_code','RegionCode','Recipient',now(),now()),
('C',1,'region_name','RegionName','Recipient',now(),now()),
('N',1,'income_group_code','IncomegroupCode','Recipient',now(),now()),
('C',1,'income_group_name','IncomegroupName','Recipient',now(),now()),
('N',1,'flow_code','FlowCode','? (Type of flow)',now(),now()),
('C',1,'flow_name','FlowName','? (Type of flow)',now(),now()),
('C',1,'bilateral_multilateral','bi_multi','Bi/Multi',now(),now()),
('C',1,'category','Category','Type of flow',now(),now()),
('C',1,'finance_type','Finance_t','Type of finance',now(),now()),
('C',1,'aid_type','Aid_t','Type of aid',now(),now()),
('N',1,'usd_commitment','usd_commitment','',now(),now()),
('N',1,'usd_disbursement','usd_disbursement','Commitments',now(),now()),
('N',1,'usd_received','usd_received','Amounts extended',now(),now()),
('N',1,'usd_commitment_deflated','usd_commitment_defl','Amounts received',now(),now()),
('N',1,'usd_disbursement_deflated','usd_disbursement_defl','Commitments',now(),now()),
('N',1,'usd_received_deflated','usd_received_defl','Amounts extended',now(),now()),
('N',1,'usd_adjustment','usd_adjustment','Amounts received',now(),now()),
('N',1,'usd_adjustment_deflated','usd_adjustment_defl','',now(),now()),
('N',1,'usd_amount_untied','usd_amountuntied','Amount untied',now(),now()),
('N',1,'usd_amount_partial_tied','usd_amountpartialtied','Amount partially untied',now(),now()),
('N',1,'usd_amount_tied','usd_amounttied','Amount tied',now(),now()),
('N',1,'usd_amount_untied_deflated','usd_amountuntied_defl','Amount untied',now(),now()),
('N',1,'usd_amount_partial_tied_deflated','usd_amountpartialtied_defl','Amount partially untied',now(),now()),
('N',1,'usd_amount_tied_deflated','usd_amounttied_defl','Amount tied',now(),now()),
('N',1,'usd_irtc','usd_IRTC','Amount of IRTC',now(),now()),
('N',1,'usd_expert_commitment','usd_expert_commitment','If project-type, amount of experts_commitments',now(),now()),
('N',1,'usd_expert_extended','usd_expert_extended','If project-type, amount of experts_extended',now(),now()),
('N',1,'usd_export_credit','usd_export_credit','Amount of export credit in AF package',now(),now()),
('N',1,'currency_code','CurrencyCode','Currency',now(),now()),
('N',1,'commitment_national','commitment_national','Commitments',now(),now()),
('N',1,'disbursement_national','disbursement_national','Amounts extended',now(),now()),
('N',1,'grant_equivalent','GrantEquiv','',now(),now()),
('N',1,'usd_grant_equivalent','usd_GrantEquiv','',now(),now()),
('C',1,'short_description','ShortDescription','Short description/Project title',now(),now()),
('C',1,'project_title','ProjectTitle','Short description/Project title',now(),now()),
('N',1,'purpose_code','PurposeCode','Sector/Purpose code',now(),now()),
('C',1,'purpose_name','PurposeName','Sector/Purpose code',now(),now()),
('N',1,'sector_code','SectorCode','Sector/Purpose code',now(),now()),
('C',1,'sector_name','SectorName','Sector/Purpose code',now(),now()),
('N',1,'channel_code','ChannelCode','Channel code',now(),now()),
('C',1,'channel_name','ChannelName','Channel of delivery',now(),now()),
('C',1,'channel_reported_name','ChannelReportedName','Channel of delivery',now(),now()),
('N',1,'parent_channel_code','ParentChannelCode','',now(),now()),
('C',1,'geography','Geography','Geographical target area',now(),now()),
('C',1,'expected_start_date','ExpectedStartDate','Expected starting date',now(),now()),
('C',1,'completion_date','CompletionDate','Expected completion date',now(),now()),
('C',1,'long_description','LongDescription','Description',now(),now()),
('C',1,'gender','Gender','Gender equality',now(),now()),
('C',1,'environment','Environment','Aid to environment',now(),now()),
('C',1,'trade','Trade','Trade development',now(),now()),
('C',1,'pdgg','Pdgg','PD/GG',now(),now()),
('C',1,'ftc','FTC','FTC',now(),now()),
('C',1,'pba','PBA','Programme-based approach',now(),now()),
('C',1,'investment_project','InvestmentProject','Investment',now(),now()),
('C',1,'associated_finance','AssocFinance','Associated financing',now(),now()),
('C',1,'biodiversity','biodiversity','Biodiversity',now(),now()),
('C',1,'climate_mitigation','climateMitigation','Climate change – mitigation',now(),now()),
('C',1,'climate_adaptation','climateAdaptation','Climate change – adaptation',now(),now()),
('C',1,'desertification','desertification','Desertification',now(),now()),
('C',1,'commitment_date','commitmentdate','',now(),now()),
('C',1,'type_repayment','typerepayment','Type of repayment',now(),now()),
('C',1,'number_repayment','numberrepayment','Number of repayments per annum',now(),now()),
('C',1,'interest_1','interest1','Interest rate',now(),now()),
('C',1,'interest_2','interest2','Second interest rate',now(),now()),
('C',1,'repay_date_1','repaydate1','First repayment date',now(),now()),
('C',1,'repay_date_2','repaydate2','Final repayment date',now(),now()),
('C',1,'grant_element','grantelement','',now(),now()),
('N',1,'usd_interest','usd_interest','Interest received',now(),now()),
('N',1,'usd_outstanding','usd_outstanding','Principal disbursed and still outstanding',now(),now()),
('N',1,'usd_arrears_principal','usd_arrears_principal','Arrears of principal (included in field 5)',now(),now()),
('N',1,'usd_arrears_interest','usd_arrears_interest','Arrears of interest',now(),now()),
('N',1,'usd_future_debt_service_principal','usd_future_DS_principal','',now(),now()),
('N',1,'usd_future_debt_service_interest','usd_future_DS_interest','',now(),now()),
('C',1,'rmnch','RMNCH','',now(),now()),
('C',1,'budget_identifier','BudgetIdent','',now(),now()),
('N',1,'capital_expenditure','CapitalExpend','',now(),now());



insert into core_sourcecolumnmap (source_id,name,source_name,updated_on,created_on)
VALUES
(2,'donor_code','DONOR',now(),now()),
(2,'donor_name','Donor',now(),now()),
(2,'part_code','PART',now(),now()),
(2,'part_name','Part',now(),now()),
(2,'aid_type_code','AIDTYPE',now(),now()),
(2,'aid_type_name','Aid type',now(),now()),
(2,'flows','FLOWS',now(),now()),
(2,'fund_flows','Fund flows',now(),now()),
(2,'amount_type_code','AMOUNTTYPE',now(),now()),
(2,'amount_type_name','Amount type',now(),now()),
(2,'time','TIME',now(),now()),
(2,'year','Year',now(),now()),
(2,'value','Value',now(),now()),
(2,'flags','Flags',now(),now());



insert into core_sourcecolumnmap (source_id,name,source_name,updated_on,created_on)
VALUES
(3,'recipient_code','RECIPIENT',now(),now()),
(3,'recipient_name','Recipient',now(),now()),
(3,'donor_code','DONOR',now(),now()),
(3,'donor_name','Donor',now(),now()),
(3,'part_code','PART',now(),now()),
(3,'part_name','Part',now(),now()),
(3,'aid_type_code','AIDTYPE',now(),now()),
(3,'aid_type_name','Aid type',now(),now()),
(3,'data_type','DATATYPE',now(),now()),
(3,'amount_type','Amount type',now(),now()),
(3,'time','TIME',now(),now()),
(3,'year','Year',now(),now()),
(3,'value','Value',now(),now()),
(3,'flags','Flags',now(),now());



insert into core_sourcecolumnmap (source_id,name,source_name,updated_on,created_on)
VALUES
(4,'recipient_code','RECIPIENT',now(),now()),
(4,'recipient_name','Recipient',now(),now()),
(4,'donor_code','DONOR',now(),now()),
(4,'donor_name','Donor',now(),now()),
(4,'part_code','PART',now(),now()),
(4,'part_name','Part',now(),now()),
(4,'aid_type_code','AIDTYPE',now(),now()),
(4,'aid_type_name','Aid type',now(),now()),
(4,'data_type','DATATYPE',now(),now()),
(4,'amount_type','Amount type',now(),now()),
(4,'time','TIME',now(),now()),
(4,'year','Year',now(),now()),
(4,'value','Value',now(),now()),
(4,'flags','Flags',now(),now());


insert into core_sourcecolumnmap (source_id,name,source_name,updated_on,created_on)
VALUES
(5,'donor_code','DONOR',now(),now()),
(5,'donor_name','Donor',now(),now()),
(5,'sector_code','SECTOR',now(),now()),
(5,'sector_name','Sector',now(),now()),
(5,'aid_type_code','AIDTYPE',now(),now()),
(5,'aid_type_name','Aid type',now(),now()),
(5,'amount_type_code','AMOUNTTYPE',now(),now()),
(5,'amount_type_name','Amount type',now(),now()),
(5,'time','TIME',now(),now()),
(5,'year','Year',now(),now()),
(5,'value','Value',now(),now()),
(5,'flags','Flags',now(),now());

insert into core_sector(name,description,updated_on,created_on) VALUES
('Finance','International Finance values',now(),now()),
('Aid','Aid to developing countries',now(),now()),
('Development','Activities within Sub saharan Africa targeting development',now(),now());


insert into core_theme(sector_id,name,updated_on,created_on)
VALUES
(1,'International Offical Finance',now(),now()),
(1,'IMF Relief Funds',now(),now()),
(2,'Unbundling Aid',now(),now());

insert into core_operation(name,description,operation_query,theme_id,sample_output_path,is_draft,updated_on,created_on)
VALUES('Oda query','Returns all sum of oda from crs table','Select * from crs.currrent where donor_code =2000 and ftr = ''Bulls''',1,'/home/ddw/queries/oda_sample.csv',FALSE,now(),now());


insert into core_tag (name,updated_on,created_on)
VALUES
('oda',now(),now()),
('crs',now(),now()),
('buyout',now(),now());


insert into core_operation_tags (operation_id,tag_id)
VALUES
(1,1),
(1,2),
(1,3);


insert into core_operationstep(operation_id,step_id,name,description,query_func,query_kwargs,source_id,updated_on,created_on)
VALUES
(1,1,'query','Get oda data from crs table','select','{}',1,now(),now()),
(1,2,'filter','Filter oda by row on oda_donor and ftr','filter','{"filters":[{"field":"year", "value":1973, "func":"eq"}]',1,now(),now());
