interface Table {
  name: string;
  caption: string; // readable alternative to the name
  columns: TableColumn[]; // in order as they appear in the DB
}

interface TableColumn {
  name: string;
  caption: string;
  type: 'number' | 'string' | 'boolean';
}

export const UPDATABLE_TABLES: Table[] = [
  {
    name: 'fts_codenames',
    caption: 'FTS Code Names',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string' },
      { name: 'codename', caption: 'Code Name', type: 'string' },
    ],
  },
  {
    name: 'fts_dacregion',
    caption: 'FTS Dac Regions',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string' },
      { name: 'Region', caption: 'Region', type: 'string' },
    ],
  },
  {
    name: 'fts_deflators',
    caption: 'FTS Deflators',
    columns: [
      { name: 'deflatortype', caption: 'Deflator Type', type: 'string' },
      { name: 'Deflators', caption: 'Deflators', type: 'string' },
    ],
  },
  {
    name: 'fts_deliverychannels',
    caption: 'FTS Delivery Channels',
    columns: [
      { name: 'Recipient.Organization', caption: 'Recipient Organisation', type: 'string' },
      { name: 'deliverychannels', caption: 'Delivery Channels', type: 'string' },
    ],
  },
  {
    name: 'fts_destinationcountryid',
    caption: 'FTS Destination Country IDs',
    columns: [
      { name: 'Destination.Country', caption: 'Destination Country', type: 'string' },
      { name: 'destinationcountryid', caption: 'Destination Country ID', type: 'string' },
    ],
  },
  {
    name: 'fts_donorscountryid',
    caption: 'FTS Donors Country IDs',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string' },
      { name: 'donorcountryid', caption: 'Donor Country ID', type: 'string' },
    ],
  },
  {
    name: 'fts_incomegroups',
    caption: 'FTS Income Groups',
    columns: [
      { name: 'destinationcountrytype', caption: 'Destination Country Type', type: 'string' },
      { name: 'incomegroups', caption: 'Income Groups', type: 'string' },
    ],
  },
  {
    name: 'fts_isos',
    caption: 'FTS ISOs',
    columns: [
      { name: 'country_name', caption: 'Country Name', type: 'string' },
      { name: 'country_code', caption: 'Country Code', type: 'string' },
      { name: 'iso3', caption: 'ISO3', type: 'string' },
    ],
  },
  {
    name: 'fts_ngotype',
    caption: 'FTS NGO Type',
    columns: [
      { name: 'Recipient.Organization', caption: 'Recipient Organisation', type: 'string' },
      { name: 'ngotype', caption: 'NGO Type', type: 'string' },
    ],
  },
  {
    name: 'fts_odaeligible',
    caption: 'FTS ODA Eligible',
    columns: [
      { name: 'Destination.Country', caption: 'Destination Country', type: 'string' },
      { name: 'odaeligible', caption: 'ODA Eligible', type: 'boolean' },
    ],
  },
  {
    name: 'fts_privatemoney',
    caption: 'FTS Private Money',
    columns: [
      { name: 'Donor', caption: 'Donor', type: 'string' },
      { name: 'privatemoney', caption: 'Private Money', type: 'boolean' },
    ],
  },
  {
    name: 'fts_recipientcodename',
    caption: 'FTS Recipient Code Name',
    columns: [
      { name: 'Recipient.Organization', caption: 'Recipient Organisation', type: 'string' },
      { name: 'recipientcodename', caption: 'Recipient Code Name', type: 'string' },
    ],
  },
  {
    name: 'fts_recipientcountryid',
    caption: 'FTS Recipient Country ID',
    columns: [
      { name: 'Recipient.Organization', caption: 'Recipient Organisation', type: 'string' },
      { name: 'recipientcountryid', caption: 'Recipient Country ID', type: 'string' },
    ],
  },
];
