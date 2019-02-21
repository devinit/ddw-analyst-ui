
drop table if exists table_meta.source;
create table table_meta.source
(
    id serial not null primary key,
    source varchar not null,
    source_acronym varchar,
    source_url text,
    updates_available json not null default '{}',
    storage_type varchar not null check (storage_type in ('schema','table')),
    table_name_mapping json not null default '{}',
    created_on timestamp not null default now()

);

COMMENT on table table_meta.source is 'Holds meta data information on the different datasources that make up the mirror tables of the warehouse';
COMMENT ON column table_meta.source.id is 'Auto incremented primary key for table_meta.source';
COMMENT on column table_meta.source.source is 'The name of the source for the data source bieng documented. E.g DAC CRS table';
COMMENt on column table_meta.source.source_acronym is 'The acronym for the name given in source if any';
comment on column table_meta.source.source_url is 'If this data source has been downloaded from a URL, this is the link to the dataset at the source';
comment on column table_meta.source.updates_available is 'A json map of date of update and table hosting the update';
comment on column table_meta.source.storage_type is 'Indication of whether its been stored in a table under a generic schema or in a schema of its own';
comment on column table_meta.source.table_name_mapping is 'A map between name tranformation between di and the original source';
comment on column table_meta.source.created_on is 'Auto generated date on which this entry was made';


drop table if exists repo.crs_current;
create table repo.crs_current(
    id serial NOT NULL,
	row_no int4 NOT NULL,
	"year" int2 NOT NULL,
	donor_code int2 NOT NULL,
	donor_name varchar NOT NULL,
	agency_code int2 NOT NULL,
	agency_name varchar NULL,
	crs_id varchar NULL,
	project_number varchar NULL,
	initial_report int2 NULL,
	recipient_code int2 NOT NULL,
	recipient_name varchar NOT NULL,
	region_code int2 NOT NULL,
	region_name varchar NOT NULL,
	income_group_code int2 NOT NULL,
	income_group_name varchar NOT NULL,
	flow_code int2 NOT NULL,
	flow_name varchar NULL,
	bilateral_multilateral int2 NOT NULL,
	category int2 NOT NULL,
	finance_type int2 NOT NULL,
	aid_type varchar NULL,
	usd_commitment numeric NULL,
	usd_disbursement numeric NULL,
	usd_received numeric NULL,
	usd_commitment_deflated numeric NULL,
	usd_disbursement_deflated numeric NULL,
	usd_received_deflated numeric NULL,
	usd_adjustment numeric NULL,
	usd_adjustment_deflated numeric NULL,
	usd_amount_untied numeric NULL,
	usd_amount_partial_tied numeric NULL,
	usd_amount_tied numeric NULL,
	usd_amount_untied_deflated numeric NULL,
	usd_amount_partial_tied_deflated numeric NULL,
	usd_amount_tied_deflated numeric NULL,
	usd_irtc numeric NULL,
	usd_expert_commitment numeric NULL,
	usd_expert_extended numeric NULL,
	usd_export_credit numeric NULL,
	currency_code int2 NOT NULL,
	commitment_national numeric NULL,
	disbursement_national numeric NULL,
	grant_equivalent varchar NULL,
	usd_grant_equivalent numeric NULL,
	short_description text NOT NULL,
	project_title text NULL,
	purpose_code int4 NOT NULL,
	purpose_name varchar NULL,
	sector_code int4 NOT NULL,
	sector_name varchar NULL,
	channel_code int4 NULL,
	channel_name varchar NULL,
	channel_reported_name varchar NULL,
	channel_parent_category int4 NULL,
	geography varchar NULL,
	expected_start_date timestamp NULL,
	completion_date timestamp NULL,
	long_description text NULL,
	gender int2 NULL,
	environment int2 NULL,
	trade int2 NULL,
	pdgg int2 NULL,
	ftc int2 NULL,
	pba int2 NULL,
	investment_project int2 NULL,
	associated_finance int2 NULL,
	biodiversity int2 NULL,
	climate_mitigation int2 NULL,
	climate_adaptation int2 NULL,
	desertification int2 NULL,
	commitment_date timestamp NULL,
	type_repayment int2 NULL,
	number_repayment int2 NULL,
	interest_1 varchar NULL,
	interest_2 varchar NULL,
	repay_date_1 timestamp NULL,
	repay_date_2 timestamp NULL,
	grant_element numeric NULL,
	usd_interest numeric NULL,
	usd_outstanding numeric NULL,
	usd_arrears_principal numeric NULL,
	usd_arrears_interest numeric NULL,
	usd_future_debt_service_principal numeric NULL,
	usd_future_debt_service_interest numeric NULL,
	rmnch int2 NULL,
	budget_identifier numeric NULL,
	capital_expenditure numeric NULL,
	CONSTRAINT crs_current_pkey PRIMARY KEY (id),
	CONSTRAINT valid_associated_finance CHECK (((associated_finance >= 0) AND (associated_finance <= 1))),
	CONSTRAINT valid_bilateral_multilateral CHECK ((bilateral_multilateral = ANY (ARRAY[1, 2, 3, 4, 5, 6, 7, 8]))),
	CONSTRAINT valid_biodiversity CHECK (((biodiversity >= 0) AND (biodiversity <= 2))),
	CONSTRAINT valid_category CHECK ((category = ANY (ARRAY[10, 21, 22, 30, 35, 36, 37, 40, 50]))),
	CONSTRAINT valid_channel_code CHECK (((channel_code >= 10000) AND (channel_code <= 90000))),
	CONSTRAINT valid_climate_adaptation CHECK (((climate_adaptation >= 0) AND (climate_adaptation <= 2))),
	CONSTRAINT valid_climate_mitigation CHECK (((climate_mitigation >= 0) AND (climate_mitigation <= 2))),
	CONSTRAINT valid_desertification CHECK (((desertification >= 0) AND (desertification <= 3))),
	CONSTRAINT valid_donor_code CHECK (((donor_code >= 1) AND (donor_code <= 1601))),
	CONSTRAINT valid_environment CHECK (((environment >= 0) AND (environment <= 2))),
	CONSTRAINT valid_finance_type CHECK (((finance_type >= 1) AND (finance_type <= 1100))),
	CONSTRAINT valid_flow_code CHECK ((flow_code = ANY (ARRAY[11, 12, 13, 14, 19, 30]))),
	CONSTRAINT valid_ftc CHECK (((ftc >= 0) AND (ftc <= 1))),
	CONSTRAINT valid_gender CHECK (((gender >= 0) AND (gender <= 2))),
	CONSTRAINT valid_income_group_name CHECK (((income_group_name)::text = ANY ((ARRAY['LDCs'::character varying, 'Other LICs'::character varying, 'LMICs'::character varying, 'UMICs'::character varying, 'Part I unallocated by income'::character varying, 'MADCTs'::character varying])::text[]))),
	CONSTRAINT valid_initial_report CHECK ((initial_report = ANY (ARRAY[1, 2, 3, 5, 8]))),
	CONSTRAINT valid_investment_project CHECK (((investment_project >= 0) AND (investment_project <= 1))),
	CONSTRAINT valid_pba CHECK (((pba >= 0) AND (pba <= 1))),
	CONSTRAINT valid_pdgg CHECK (((pdgg >= 0) AND (pdgg <= 2))),
	CONSTRAINT valid_purpose_code CHECK (((purpose_code >= 100) AND (purpose_code <= 100000))),
	CONSTRAINT valid_recipient_code CHECK ((((recipient_code >= 30) AND (recipient_code <= 998)) OR (recipient_code = 9998))),
	CONSTRAINT valid_rmnch CHECK (((rmnch >= 0) AND (rmnch <= 4))),
	CONSTRAINT valid_sector_code CHECK (((sector_code >= 100) AND (sector_code <= 998))),
	CONSTRAINT valid_trade CHECK (((trade >= 0) AND (trade <= 2))),
	CONSTRAINT valid_year CHECK (((year >= 1973) AND (year <= 2018)))
)
WITH (
	OIDS=FALSE
) ;

comment on table repo.crs_current is 'Content of most DAC CRS mirror';

drop table if exists repo.dac5_current;

create table repo.dac5_current(

	row_id serial NOT NULL,
	donor_code int2 NOT NULL,
	donor_name varchar NOT NULL,
	sector_code int2 NOT NULL,
	sector_name varchar NOT NULL,
	aid_type_code int4 NOT NULL,
	aid_type_name varchar NOT NULL,
	amount_type_code bpchar(1) NOT NULL,
	amount_type_name varchar NOT NULL,
	"time" int2 NOT NULL,
	"year" int2 NOT NULL,
	value numeric NULL,
	flags text NULL,
	CONSTRAINT table_current_pkey PRIMARY KEY (row_id),
	CONSTRAINT valid_aid_type_code CHECK ((aid_type_code = ANY (ARRAY[528, 529, 530]))),
	CONSTRAINT valid_amount_type_code CHECK ((amount_type_code = ANY (ARRAY['A'::bpchar, 'D'::bpchar]))),
	CONSTRAINT valid_donor_code CHECK (((donor_code >= 1) AND (donor_code <= 20011))),
	CONSTRAINT valid_sector_code CHECK (((sector_code >= 100) AND (sector_code <= 1000))),
	CONSTRAINT valid_time CHECK ((("time" >= 1960) AND ("time" <= 2015))),
	CONSTRAINT valid_year CHECK (((year >= 1960) AND (year <= 2015)))
)
WITH (
	OIDS=FALSE
) ;

comment on table repo.dac5_current is 'Content of most recent DAC 5 mirror data';

drop table if exists repo.dac2b_current;

create table repo.dac2b_current(
    row_id serial NOT NULL,
	recipient_code int2 NOT NULL,
	recipient_name varchar NOT NULL,
	donor_code int2 NOT NULL,
	donor_name varchar NOT NULL,
	part_code int4 NOT NULL,
	part_name varchar NOT NULL,
	aid_type_code int2 NOT NULL,
	aid_type_name varchar NOT NULL,
	data_type bpchar(1) NOT NULL,
	amount_type varchar NOT NULL,
	"time" int2 NOT NULL,
	"year" int2 NOT NULL,
	value numeric NULL,
	flags text NULL,
	CONSTRAINT table_2b_current_pkey PRIMARY KEY (row_id),
	CONSTRAINT valid_aid_type_code CHECK (((aid_type_code >= 201) AND (aid_type_code <= 972))),
	CONSTRAINT valid_data_type CHECK ((data_type = ANY (ARRAY['A'::bpchar, 'D'::bpchar]))),
	CONSTRAINT valid_donor_code CHECK (((donor_code >= 1) AND (donor_code <= 20018))),
	CONSTRAINT valid_part_code CHECK ((part_code = ANY (ARRAY[1, 2]))),
	CONSTRAINT valid_part_name CHECK (((part_name)::text = ANY (ARRAY[('1 : Part I - Developing Countries'::character varying)::text, ('2 : Part II - Countries in Transition'::character varying)::text]))),
	CONSTRAINT valid_recipient_code CHECK (((recipient_code >= 30) AND (recipient_code <= 10203))),
	CONSTRAINT valid_time CHECK ((("time" >= 1960) AND ("time" <= 2014))),
	CONSTRAINT valid_year CHECK (((year >= 1960) AND (year <= 2014)))
)
WITH (
	OIDS=FALSE
) ;

comment on table repo.dac2b_current is 'Content of most recent DAC 2B mirror';

drop table if exists repo.dac2a_current;

create table repo.dac2a_current(
	row_id serial NOT NULL,
	recipient_code int2 NOT NULL,
	recipient_name varchar NOT NULL,
	donor_code int2 NOT NULL,
	donor_name varchar NOT NULL,
	part_code int4 NOT NULL,
	part_name varchar NOT NULL,
	aid_type_code int2 NOT NULL,
	aid_type_name varchar NOT NULL,
	data_type bpchar(1) NOT NULL,
	amount_type varchar NOT NULL,
	"time" int2 NOT NULL,
	"year" int2 NOT NULL,
	value numeric NULL,
	flags text NULL,
	CONSTRAINT table_2a_current_pkey PRIMARY KEY (row_id),
	CONSTRAINT valid_aid_type_code CHECK (((aid_type_code >= 106) AND (aid_type_code <= 255))),
	CONSTRAINT valid_data_type CHECK ((data_type = ANY (ARRAY['A'::bpchar, 'D'::bpchar]))),
	CONSTRAINT valid_donor_code CHECK (((donor_code >= 1) AND (donor_code <= 21600))),
	CONSTRAINT valid_part_code CHECK ((part_code = ANY (ARRAY[1, 2]))),
	CONSTRAINT valid_part_name CHECK (((part_name)::text = ANY (ARRAY[('1 : Part I - Developing Countries'::character varying)::text, ('2 : Part II - Countries in Transition'::character varying)::text]))),
	CONSTRAINT valid_recipient_code CHECK (((recipient_code >= 30) AND (recipient_code <= 10203))),
	CONSTRAINT valid_time CHECK ((("time" >= 1960) AND ("time" <= 2014))),
	CONSTRAINT valid_year CHECK (((year >= 1960) AND (year <= 2014)))
)
WITH (
	OIDS=FALSE
) ;

comment on table repo.dac2a_current is 'Content of most recent DAC 2A mirror';

drop table if exists repo.dac1_current;
create table repo.dac1_current(
    row_id serial NOT NULL,
	donor_code int2 NOT NULL,
	donor_name varchar NOT NULL,
	part_code int2 NOT NULL,
	part_name varchar NOT NULL,
	aid_type_code int4 NOT NULL,
	aid_type_name varchar NOT NULL,
	flows int2 NOT NULL,
	fund_flows varchar NOT NULL,
	amount_type_code bpchar(1) NOT NULL,
	amount_type_name varchar NOT NULL,
	"time" int2 NOT NULL,
	"year" int2 NOT NULL,
	value numeric NULL,
	flags text NULL,
	CONSTRAINT table_1_data_current_pkey PRIMARY KEY (row_id),
	CONSTRAINT valid_aid_type_code CHECK (((aid_type_code >= 1) AND (aid_type_code <= 99999))),
	CONSTRAINT valid_amount_type_code CHECK ((amount_type_code = ANY (ARRAY['A'::bpchar, 'D'::bpchar, 'N'::bpchar]))),
	CONSTRAINT valid_donor_code CHECK (((donor_code >= 1) AND (donor_code <= 20011))),
	CONSTRAINT valid_flows CHECK ((flows = ANY (ARRAY[1120, 1121, 1122, 1130, 1140, 1150, 1151, 1152]))),
	CONSTRAINT valid_part_code CHECK ((part_code = 1)),
	CONSTRAINT valid_part_name CHECK (((part_name)::text = '1 : Part I - Developing Countries'::text)),
	CONSTRAINT valid_time CHECK ((("time" >= 1960) AND ("time" <= 2018))),
	CONSTRAINT valid_year CHECK (((year >= 1960) AND (year <= 2018)))
);

comment on table repo.dac1_current is 'Content of most recent DAC 1 mirror';

drop table if exists query_meta.sector cascade;
create table query_meta.sector
(
    id serial primary key not null,
    name varchar(20) not null,
    description text,
    createdOn timestamp not null default now()
);

comment on table query_meta.sector is 'A list of sectors that DI analysts work around';
comment on column query_meta.sector.id is 'Auto generated pk for sector table';
comment on column query_meta.sector.name is 'Name of the sector that is being';

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
    created_on timestamp not null default now()
);

comment on table query_meta.theme is 'All queries that are saved by the analyst must have a theme';
comment on column query_meta.theme.id is 'Auto generated identifier for the column';
comment on column query_meta.theme.sector_id is 'A reference to the sector that the theme targets';
comment on column query_meta.theme.name is 'The name of the theme';
comment on column query_meta.theme.created_on is 'The day on which the theme was created';


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

comment on table query_meta.reviews is 'Contains the reviews on operations that has been added by other users';

CREATE OR REPLACE FUNCTION updated_on_column_updater()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_on = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';


CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON query_meta.reviews FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON query_meta.operation_steps FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON query_meta.operation_tags FOR EACH ROW EXECUTE PROCEDURE  updated_on_column_updater();