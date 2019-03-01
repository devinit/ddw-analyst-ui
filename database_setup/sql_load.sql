
insert into core_source 
(indicator,indicator_acronym,source,source_acronym,source_url,download_path,storage_type,active_mirror_name,description,last_updated_on)
values
('Common Reporting Standard','crs','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','crs_current','Data about flows of resources',now()),
('Official Development Assistance 1','dac1','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac1_current','Data about flows of resources',now()),
('Official Development Assistance2','dac2','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac2_current','Data about flows of resources',now()),
('Official Development Assistance 2b','dac2b','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac2b_current','Data about flows of resources',now()),
('Official Development Assistance 5','dac5','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac5_current','Data about flows of resources',now()),
('World Bank Indicators','WDI','World Bank Group','WBG','http://wdi.worldbank.org','http://wdi.worldbank.org/tables','schema','wdi','Data about flows of resources',now());


insert into core_update_history (source_id,history_table,released_on,release_description,invalidated_on,invalidation_description)
values
(1,'crs_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),'New release December 2018')
(1,'crs_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now() - interval '2000 hours','New release December 2017')
(2,'dac1_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),'New release December 2018')
(2,'dac1_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now() - interval '2000 hours','New release December 2017')
(3,'dac2_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),'New release December 2018')
(3,'dac2_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now() - interval '2000 hours','New release December 2017')
(3,'dac2b_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),'New release December 2018')
(3,'dac2b_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now() - interval '2000 hours','New release December 2017')
(4,'dac2b_2018_09_10',now() - interval '2000 hours','Official release for 2018 April',now(),'New release December 2018')
(4,'dac2b_2018_02_10',now() - interval '4000 hours','Official release for 2018 April',now() - interval '2000 hours','New release December 2017');




insert into core_source_column_map (source_id,name,source_name,description)
VALUES
(1,'year','Year','Reporting year'),
(1,'donor_code','DonorCode','Reporting country/organisation'),
(1,'donor_name','DonorName','Reporting country/organisation'),
(1,'agency_code','AgencyCode','Extending agency'),
(1,'agency_name','AgencyName','Extending agency'),
(1,'crs_id','CRSid','CRS Identification number'),
(1,'project_number','ProjectNumber','Donor project number'),
(1,'initial_report','InitialReport','Nature of submission'),
(1,'recipient_code','RecipientCode','Recipient'),
(1,'recipient_name','RecipientName','Recipient'),
(1,'region_code','RegionCode','Recipient'),
(1,'region_name','RegionName','Recipient'),
(1,'income_group_code','IncomegroupCode','Recipient'),
(1,'income_group_name','IncomegroupName','Recipient'),
(1,'flow_code','FlowCode','? (Type of flow)'),
(1,'flow_name','FlowName','? (Type of flow)'),
(1,'bilateral_multilateral','bi_multi','Bi/Multi'),
(1,'category','Category','Type of flow'),
(1,'finance_type','Finance_t','Type of finance'),
(1,'aid_type','Aid_t','Type of aid'),
(1,'usd_commitment','usd_commitment',''),
(1,'usd_disbursement','usd_disbursement','Commitments'),
(1,'usd_received','usd_received','Amounts extended'),
(1,'usd_commitment_deflated','usd_commitment_defl','Amounts received'),
(1,'usd_disbursement_deflated','usd_disbursement_defl','Commitments'),
(1,'usd_received_deflated','usd_received_defl','Amounts extended'),
(1,'usd_adjustment','usd_adjustment','Amounts received'),
(1,'usd_adjustment_deflated','usd_adjustment_defl',''),
(1,'usd_amount_untied','usd_amountuntied','Amount untied'),
(1,'usd_amount_partial_tied','usd_amountpartialtied','Amount partially untied'),
(1,'usd_amount_tied','usd_amounttied','Amount tied'),
(1,'usd_amount_untied_deflated','usd_amountuntied_defl','Amount untied'),
(1,'usd_amount_partial_tied_deflated','usd_amountpartialtied_defl','Amount partially untied'),
(1,'usd_amount_tied_deflated','usd_amounttied_defl','Amount tied'),
(1,'usd_irtc','usd_IRTC','Amount of IRTC'),
(1,'usd_expert_commitment','usd_expert_commitment','If project-type, amount of experts_commitments'),
(1,'usd_expert_extended','usd_expert_extended','If project-type, amount of experts_extended'),
(1,'usd_export_credit','usd_export_credit','Amount of export credit in AF package'),
(1,'currency_code','CurrencyCode','Currency'),
(1,'commitment_national','commitment_national','Commitments'),
(1,'disbursement_national','disbursement_national','Amounts extended'),
(1,'grant_equivalent','GrantEquiv',''),
(1,'usd_grant_equivalent','usd_GrantEquiv',''),
(1,'short_description','ShortDescription','Short description/Project title'),
(1,'project_title','ProjectTitle','Short description/Project title'),
(1,'purpose_code','PurposeCode','Sector/Purpose code'),
(1,'purpose_name','PurposeName','Sector/Purpose code'),
(1,'sector_code','SectorCode','Sector/Purpose code'),
(1,'sector_name','SectorName','Sector/Purpose code'),
(1,'channel_code','ChannelCode','Channel code'),
(1,'channel_name','ChannelName','Channel of delivery'),
(1,'channel_reported_name','ChannelReportedName','Channel of delivery'),
(1,'parent_channel_code','ParentChannelCode',''),
(1,'geography','Geography','Geographical target area'),
(1,'expected_start_date','ExpectedStartDate','Expected starting date'),
(1,'completion_date','CompletionDate','Expected completion date'),
(1,'long_description','LongDescription','Description'),
(1,'gender','Gender','Gender equality'),
(1,'environment','Environment','Aid to environment'),
(1,'trade','Trade','Trade development'),
(1,'pdgg','Pdgg','PD/GG'),
(1,'ftc','FTC','FTC'),
(1,'pba','PBA','Programme-based approach'),
(1,'investment_project','InvestmentProject','Investment'),
(1,'associated_finance','AssocFinance','Associated financing'),
(1,'biodiversity','biodiversity','Biodiversity'),
(1,'climate_mitigation','climateMitigation','Climate change – mitigation'),
(1,'climate_adaptation','climateAdaptation','Climate change – adaptation'),
(1,'desertification','desertification','Desertification'),
(1,'commitment_date','commitmentdate',''),
(1,'type_repayment','typerepayment','Type of repayment'),
(1,'number_repayment','numberrepayment','Number of repayments per annum'),
(1,'interest_1','interest1','Interest rate'),
(1,'interest_2','interest2','Second interest rate'),
(1,'repay_date_1','repaydate1','First repayment date'),
(1,'repay_date_2','repaydate2','Final repayment date'),
(1,'grant_element','grantelement',''),
(1,'usd_interest','usd_interest','Interest received'),
(1,'usd_outstanding','usd_outstanding','Principal disbursed and still outstanding'),
(1,'usd_arrears_principal','usd_arrears_principal','Arrears of principal (included in field 5)'),
(1,'usd_arrears_interest','usd_arrears_interest','Arrears of interest'),
(1,'usd_future_debt_service_principal','usd_future_DS_principal',''),
(1,'usd_future_debt_service_interest','usd_future_DS_interest',''),
(1,'rmnch','RMNCH',''),
(1,'budget_identifier','BudgetIdent',''),
(1,'capital_expenditure','CapitalExpend','');



insert into core_source_column_map (source_id,name,source_name)
VALUES
(2,'donor_code','DONOR'),
(2,'donor_name','Donor'),
(2,'part_code','PART'),
(2,'part_name','Part'),
(2,'aid_type_code','AIDTYPE'),
(2,'aid_type_name','Aid type'),
(2,'flows','FLOWS'),
(2,'fund_flows','Fund flows'),
(2,'amount_type_code','AMOUNTTYPE'),
(2,'amount_type_name','Amount type'),
(2,'time','TIME'),
(2,'year','Year'),
(2,'value','Value'),
(2,'flags','Flags');



insert into core_source_column_map (source_id,name,source_name)
VALUES
(3,'recipient_code','RECIPIENT'),
(3,'recipient_name','Recipient'),
(3,'donor_code','DONOR'),
(3,'donor_name','Donor'),
(3,'part_code','PART'),
(3,'part_name','Part'),
(3,'aid_type_code','AIDTYPE'),
(3,'aid_type_name','Aid type'),
(3,'data_type','DATATYPE'),
(3,'amount_type','Amount type'),
(3,'time','TIME'),
(3,'year','Year'),
(3,'value','Value'),
(3,'flags','Flags');



insert into core_source_column_map (source_id,name,source_name)
VALUES
(4,'recipient_code','RECIPIENT'),
(4,'recipient_name','Recipient'),
(4,'donor_code','DONOR'),
(4,'donor_name','Donor'),
(4,'part_code','PART'),
(4,'part_name','Part'),
(4,'aid_type_code','AIDTYPE'),
(4,'aid_type_name','Aid type'),
(4,'data_type','DATATYPE'),
(4,'amount_type','Amount type'),
(4,'time','TIME'),
(4,'year','Year'),
(4,'value','Value'),
(4,'flags','Flags');


insert into core_source_column_map (source_id,name,source_name)
VALUES
(5,'donor_code','DONOR'),
(5,'donor_name','Donor'),
(5,'sector_code','SECTOR'),
(5,'sector_name','Sector'),
(5,'aid_type_code','AIDTYPE'),
(5,'aid_type_name','Aid type'),
(5,'amount_type_code','AMOUNTTYPE'),
(5,'amount_type_name','Amount type'),
(5,'time','TIME'),
(5,'year','Year'),
(5,'value','Value'),
(5,'flags','Flags');

insert into core_sector(name,description) VALUES
('Finance','International Finance values'),
('Aid','Aid to developing countries'),
('Development','Activities within Sub saharan Africa targeting development');


insert into core_theme(sector_id,name)
VALUES
(1,'International Offical Finance'),
(1,'IMF Relief Funds'),
(2,'Unbundling Aid');

insert into core_operation(name,description,user_id,operation_query,theme_id,sample_output_path)
VALUES('Oda query','Returns all sum of oda from crs table',1,'Select * from crs.currrent where donor_code =2000 and ftr = ''Bulls''',1,'/home/ddw/queries/oda_sample.csv');


insert into core_operation_tags (operation_id,tags)
VALUES
(1,'oda:crs:buyout:test');

insert into core_operation_steps(operation_id,step_id,name,description,query)
VALUES
(1,1,'query','Get oda data from crs table','select * from crs.current'),
(1,2,'filter','Filter oda by row on oda_donor and ftr','Select * from crs.current where donor_code = 2000 and ftr =''Badman''');
