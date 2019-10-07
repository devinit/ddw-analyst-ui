import { List, Map } from 'immutable';

export interface Dataset {
  id: string;
  title: string;
  description: string;
  publication: string;
  releasedAt: string;
  geography: string;
  geographicCode: string | null;
  createdBy: string;
  licence: string | null;
  citation: string | null;
}
export type DatasetMap = Map<keyof Dataset, Dataset[keyof Dataset]>;
export type DatasetList = List<DatasetMap>;
