
CREATE OR REPLACE FUNCTION updated_on_column_updater()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_on = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

drop table if exists table_meta.source;

create table table_meta.source
(
    id serial not null primary key,
	indicator varchar not null,
	indicator_acronym varchar,
    source varchar not null,
    source_acronym varchar,
    source_url text,
	download_path text,
    last_updated_on timestamp not null,
    storage_type varchar not null check (storage_type in ('schema','table')),
    active_mirror_name varchar not null,
	description text,
    created_on timestamp not null default now(),
	updated_on timestamp

);

CREATE TRIGGER source_modtime BEFORE UPDATE ON table_meta.source FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

COMMENT on table table_meta.source is 'Holds meta data information on the different datasources that make up the mirror tables of the warehouse';

COMMENT ON column table_meta.source.id is 'Auto incremented primary key for table_meta.source';
COMMENT on column table_meta.source.indicator is 'The name of the indicator  as known within DI';
COMMENT on column table_meta.source.indicator_acronym is 'The acronym for indicator as know within DI';
COMMENT on column table_meta.source.source is 'The name of the source for the data source bieng documented. E.g DAC CRS table';
COMMENt on column table_meta.source.source_acronym is 'The acronym for the name given in source if any';
comment on column table_meta.source.source_url is 'If this data source has been downloaded from a URL, this is the link to the dataset at the source';
COMMENT on column table_meta.source.last_updated_on is 'The last time this dataset was updated as per official source';
comment on column table_meta.source.storage_type is 'Indication of whether its been stored in a table under a generic schema or in a schema of its own';
comment on column table_meta.source.active_mirror_name is 'Action location where this data is stored in where house';
comment on column table_meta.source.created_on is 'Auto generated date on which this entry was made';
comment on column table_meta.source.updated_on is 'Auto generated date on which this table was last updated';


insert into table_meta.source 
(indicator,indicator_acronym,source,source_acronym,source_url,download_path,storage_type,active_mirror_name,description,last_updated_on)
values
('Common Reporting Standard','crs','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','crs_current','Data about flows of resources',now()),
('Official Development Assistance 1','dac1','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac1_current','Data about flows of resources',now()),
('Official Development Assistance2','dac2','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac2_current','Data about flows of resources',now()),
('Official Development Assistance 2b','dac2b','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac2b_current','Data about flows of resources',now()),
('Official Development Assistance 5','dac5','Organization for Economic Corporation and Development','oecd','https://stats.oecd.org','https://stats.oecd.org/DownloadFiles.aspx?DatasetCode=CRS1','table','dac5_current','Data about flows of resources',now()),
('World Bank Indicators','WDI','World Bank Group','WBG','http://wdi.worldbank.org','http://wdi.worldbank.org/tables','schema','wdi','Data about flows of resources',now());


drop table if exists table_meta.update_history;

create table table_meta.update_history
(
	id serial primary key not null,
	source_id integer not null references table_meta.source (id) on update cascade on delete restrict,
	history_table varchar not null,
	is_major_release boolean not null default True,
	released_on timestamp not null,
	release_description text not null, 
	invalidated_on timestamp not null,
	invalidation_description text not null,
	created_on timestamp not null default now(),
	updated_on timestamp

);

CREATE TRIGGER update_history_modtime BEFORE UPDATE ON table_meta.update_history FOR EACH ROW EXECUTE PROCEDURE updated_on_column_updater();



insert into table_meta.update_history (source_id,history_table,released_on,release_description,invalidated_on,invalidation_description)
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

create table table_meta.source_column_map
(
	id serial not null primary key,
	source_id integer references table_meta.source(id) on update cascade on delete restrict,
	name varchar not null,
	source_name varchar not null,
	created_on timestamp not null default now(),
	updated_on timestamp,
	constraint source_id_name_unique UNIQUE(source_id,name)
);


insert into table_meta.source_column_map (source_id,name,source_name,description)
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



insert into table_meta.source_column_map (source_id,name,source_name)
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



insert into table_meta.source_column_map (source_id,name,source_name)
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



insert into table_meta.source_column_map (source_id,name,source_name)
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


insert into table_meta.source_column_map (source_id,name,source_name)
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


drop table if exists query_meta.sector cascade;
create table query_meta.sector
(
    id serial primary key not null,
    name varchar(20) not null,
    description text,
    createdOn timestamp not null default now(),
	updated_on timestamp
);

CREATE TRIGGER sector_modtime BEFORE UPDATE ON query_meta.sector FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

comment on table query_meta.sector is 'A list of sectors that DI analysts work around';
comment on column query_meta.sector.id is 'Auto generated pk for sector table';
comment on column query_meta.sector.name is 'Name of the sector that is being';
comment on column query_meta.sector.updated_on is 'Auto generated date on which this table was last updated';

--- Test data
insert into query_meta.sector(name,description) VALUES
('Finance','International Finance values'),
('Aid','Aid to developing countries'),
('Development','Activities within Sub saharan Africa targeting development');


drop table if exists query_meta.theme cascade;

create table query_meta.theme(
    id serial primary key not null, 
    sector_id integer not null references query_meta.sector(id) on update cascade on delete restrict,
    name varchar(50) not null,
    created_on timestamp not null default now(),
	updated_on timestamp
);

CREATE TRIGGER theme_modtime BEFORE UPDATE ON query_meta.theme FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

comment on table query_meta.theme is 'All queries that are saved by the analyst must have a theme';
comment on column query_meta.theme.id is 'Auto generated identifier for the column';
comment on column query_meta.theme.sector_id is 'A reference to the sector that the theme targets';
comment on column query_meta.theme.name is 'The name of the theme';
comment on column query_meta.theme.created_on is 'The day on which the theme was created';
comment on column query_meta.theme.updated_on is 'Auto generated date on which this table was last updated';


-- Test data
insert into query_meta.theme(sector_id,name)
VALUES
(1,'International Offical Finance'),
(1,'IMF Relief Funds'),
(2,'Unbundling Aid');

drop table if exists query_meta.operation; 

create table query_meta.operation(
    id serial primary key not null,
    name varchar not null,
    description text not null,
    user_id integer not null references user_mgnt.auth_user(id) on update cascade on delete restrict,
    operation_query text not null,
    theme_id integer not null references query_meta.theme(id) on update cascade on delete restrict,
    sample_output_path text,
	is_draft boolean not null default TRUE,
    created_on timestamp not null default now(),
    updated_on timestamp

);

CREATE TRIGGER operation_modtime BEFORE UPDATE ON query_meta.operation FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();


comment on table query_meta.operation is 'The operation that has been performed by the user';
comment on column query_meta.operation.id is 'Auto generated id of for the operation';
comment on column query_meta.operation.name is 'Name of the operation as given by the user';
comment on column query_meta.operation.user_id is 'User that run the operation';
comment on column query_meta.operation.operation_query is 'The full text query for the operation';
comment on column query_meta.operation.theme_id is 'Theme that is target by this operation';
comment on column query_meta.operation.sample_output_path is 'The final result of the query limited to about 50 records that can be previewed';
comment on column query_meta.operation.created_on is 'Date on which this operation was created';
comment on column query_meta.operation.updated_on is 'Date on which this operation was updated';


-- Table test data
insert into query_meta.operation(name,description,user_id,operation_query,theme_id,sample_output_path)
VALUES('Oda query','Returns all sum of oda from crs table',1,'Select * from crs.currrent where donor_code =2000 and ftr = ''Bulls''',1,'/home/ddw/queries/oda_sample.csv');

drop table if exists query_meta.operation_tags;

create table query_meta.operation_tags(
    id serial primary key not null,
    operation_id integer not null references query_meta.theme(id) on update cascade on delete restrict,
    tags text not null,
    created_on timestamp not null default now(),
	updated_on timestamp
);

drop index query_meta.tags_search_index;
create index query_tags_search_index on query_meta.operation_tags(lower(tags));

CREATE TRIGGER update_op_tags_modtime BEFORE UPDATE ON query_meta.operation_tags FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

comment on table query_meta.operation_tags is 'Holds list of tags searchable to link to list of operations performed by other users';


-- table test data
insert into query_meta.operation_tags (operation_id,tags)
VALUES
(1,'oda:crs:buyout:test');

drop table if exists query_meta.operation_steps;

create table query_meta.operation_steps(
    id serial primary key not null,
    operation_id integer  not null references query_meta.operation(id) on update cascade on delete restrict,
    step_id smallint not null,
    name varchar(20) not null CHECK (lower(name) in ('query','filter','aggregate','group','order')),
    description text,
    query text,
    created_on timestamp not null default now(),
	updated_on timestamp,
    UNIQUE(operation_id,step_id)

);

CREATE TRIGGER update_op_steps_modtime BEFORE UPDATE ON query_meta.operation_steps FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

comment on table query_meta.operation_steps is 'The steps that have been taken to come up with a final operation';
comment on column query_meta.operation_steps.id is 'Auto generated ID for this table';
comment on column query_meta.operation_steps.operation_id is 'Foreign key reference to the actual operation in operation table thats affected by this step';
comment on column query_meta.operation_steps.step_id is 'Step id and operation id makes the unique step for this  operation';
comment on column query_meta.operation_steps.name is 'The kind of operation that has been performed on this step';

-- Table test data
insert into query_meta.operation_steps(operation_id,step_id,name,description,query)
VALUES
(1,1,'query','Get oda data from crs table','select * from crs.current'),
(1,2,'filter','Filter oda by row on oda_donor and ftr','Select * from crs.current where donor_code = 2000 and ftr =''Badman''');

drop table if exists query_meta.reviews;

create table query_meta.reviews(
    id serial primary key not null,
    operation_id integer  references query_meta.operation(id) on update cascade on delete restrict,
    reviewer integer not null references user_mgnt.auth_user(id),
    rating smallint not null default 0 check (((rating < 6) AND (rating > 0))),
    comment text,
    created_on timestamp not null default now(),
	updated_on timestamp
);

CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON query_meta.reviews FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();

comment on table query_meta.reviews is 'Contains the reviews on operations that has been added by other users';