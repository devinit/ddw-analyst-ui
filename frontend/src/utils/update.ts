import axios, { AxiosError } from 'axios';
import * as localForage from 'localforage';
import { DropdownItemProps } from 'semantic-ui-react';
import { CSVData, CSVDataOnly } from '../components/FileInput';
import { api } from './api';
import { localForageKeys } from './localForage';

export interface UpdateTable {
  name: string;
  caption: string; // readable alternative to the name
  columns: UpdateTableColumn[]; // in order as they appear in the DB
}

export interface UpdateTableColumn {
  name: string;
  caption: string;
  type: 'number' | 'string' | 'boolean';
  values?: (string | number)[];
  required?: boolean;
}

export const UPDATABLE_TABLES: UpdateTable[] = [
  {
    name: 'fts_codenames',
    caption: 'FTS Code Names',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string', required: true },
      { name: 'codename', caption: 'Code Name', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_dacregion',
    caption: 'FTS Dac Regions',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string', required: true },
      { name: 'Region', caption: 'Region', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_deflators',
    caption: 'FTS Deflators',
    columns: [
      { name: 'deflatortype', caption: 'Deflator Type', type: 'string', required: true },
      { name: 'Deflators', caption: 'Deflators', type: 'number', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_deliverychannels',
    caption: 'FTS Delivery Channels',
    columns: [
      {
        name: 'Recipient.Organization',
        caption: 'Recipient Organisation',
        type: 'string',
        required: true,
      },
      { name: 'deliverychannels', caption: 'Delivery Channels', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_destinationcountryid',
    caption: 'FTS Destination Country IDs',
    columns: [
      {
        name: 'Destination.Country',
        caption: 'Destination Country',
        type: 'string',
        required: true,
      },
      {
        name: 'destinationcountryid',
        caption: 'Destination Country ID',
        type: 'string',
        required: true,
      },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_donorscountryid',
    caption: 'FTS Donors Country IDs',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string', required: true },
      { name: 'donorcountryid', caption: 'Donor Country ID', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_incomegroups',
    caption: 'FTS Income Groups',
    columns: [
      {
        name: 'destinationcountrytype',
        caption: 'Destination Country Type',
        type: 'string',
        required: true,
      },
      { name: 'incomegroups', caption: 'Income Groups', type: 'string' },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_isos',
    caption: 'FTS ISOs',
    columns: [
      { name: 'country_name', caption: 'Country Name', type: 'string', required: true },
      { name: 'country_code', caption: 'Country Code', type: 'string', required: true },
      { name: 'iso3', caption: 'ISO3', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_ngotype',
    caption: 'FTS NGO Type',
    columns: [
      {
        name: 'Recipient.Organization',
        caption: 'Recipient Organisation',
        type: 'string',
        required: true,
      },
      { name: 'ngotype', caption: 'NGO Type', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_odaeligible',
    caption: 'FTS ODA Eligible',
    columns: [
      {
        name: 'Destination.Country',
        caption: 'Destination Country',
        type: 'string',
        required: true,
      },
      {
        name: 'odaeligible',
        caption: 'ODA Eligible',
        type: 'string',
        values: ['ODA-eligible', 'Non-ODA eligible'],
        required: true,
      },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_privatemoney',
    caption: 'FTS Private Money',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string', required: true },
      {
        name: 'privatemoney',
        caption: 'Private Money',
        type: 'string',
        values: ['no', 'private'],
        required: true,
      },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_recipientcodename',
    caption: 'FTS Recipient Code Name',
    columns: [
      {
        name: 'Recipient.Organization',
        caption: 'Recipient Organisation',
        type: 'string',
        required: true,
      },
      { name: 'recipientcodename', caption: 'Recipient Code Name', type: 'string', required: true },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'fts_recipientcountryid',
    caption: 'FTS Recipient Country ID',
    columns: [
      {
        name: 'Recipient.Organization',
        caption: 'Recipient Organisation',
        type: 'string',
        required: true,
      },
      {
        name: 'recipientcountryid',
        caption: 'Recipient Country ID',
        type: 'string',
        required: true,
      },
      { name: 'year', caption: 'Source Usage Year', type: 'string', required: true },
    ],
  },
  {
    name: 'iati_publishers',
    caption: 'IATI Publishers',
    columns: [
      {
        name: 'reporting_org_ref',
        caption: 'Reporting Organisation Reference',
        type: 'string',
        required: true,
      },
      {
        name: 'registry_id',
        caption: 'Registry ID',
        type: 'string',
        required: true,
      },
      { name: 'org_type', caption: 'Organisation Type (DI)', type: 'string', required: true },
      { name: 'org_name', caption: 'Organisation Name (DI)', type: 'string', required: true },
      { name: 'abbreviation', caption: 'Abbreviation', type: 'string', required: false },
      { name: 'usability_score', caption: 'Usability Score', type: 'string', required: false },
      { name: 'tracker_commit', caption: 'Tracker Commit', type: 'string', required: false },
      { name: 'tracker_spend', caption: 'Tracker Spend', type: 'string', required: false },
      {
        name: 'latest_txn_year',
        caption: 'Last Transaction Year',
        type: 'string',
        required: false,
      },
      { name: 'hq_country', caption: 'HQ Country', type: 'string', required: false },
      { name: 'CRS_codes', caption: 'CRS Codes', type: 'string', required: false },
      {
        name: 'IATI_organisation_type',
        caption: 'IATI Organisation Type',
        type: 'string',
        required: true,
      },
      {
        name: 'IATI_organisation_name',
        caption: 'IATI Organisation Name',
        type: 'string',
        required: true,
      },
      { name: 'country', caption: 'Country', type: 'string', required: false },
    ],
  },
];

export const getUpdatableTableSelectOptions = (): DropdownItemProps[] =>
  UPDATABLE_TABLES.map((table) => ({
    text: table.caption,
    value: table.name,
  }));

interface UpdateReponse {
  error?: AxiosError;
}

const organiseData = (table: UpdateTable, data: CSVData): CSVDataOnly => {
  const numberOfColumns = table.columns.length;
  const filtered = data.data.filter((_data) => _data.length === numberOfColumns);

  return filtered;
};

export const updateTable = async (table: UpdateTable, data: CSVData): Promise<UpdateReponse> => {
  const url = `${api.routes.UPDATE_TABLE}${table.name}/`;
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  try {
    const response = await axios.request<string>({
      url,
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
      data: { data: organiseData(table, data) },
    });
    console.log(response);

    if (response.status === 200) {
      return {};
    }

    return { error: response as any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (error) {
    return { error: error as AxiosError };
  }
};
