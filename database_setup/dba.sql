
-- Drop any connections that exist

SELECT 
    pg_terminate_backend(pid) 
FROM 
    pg_stat_activity 
WHERE 
    -- don't kill my own connection!
    pid <> pg_backend_pid()
    -- don't kill the connections to other databases
    AND datname = 'analyst_ui'
    ;

drop database if exists analyst_ui;
create database analyst_ui;

\c analyst_ui
-- Basic stuff stuff

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET default_tablespace = '';
SET default_with_oids = false;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;

create schema repo;

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