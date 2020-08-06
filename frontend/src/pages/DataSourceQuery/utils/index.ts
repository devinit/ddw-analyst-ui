import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';

const BASEPATH = api.routes.DATASETS;

export interface ResultData {
  id: number;
  name: string;
  updated_on: string;
  is_draft: boolean;
}

export interface QueryResult {
  count: number;
  next?: number;
  previous?: number;
  results: Array<ResultData>;
}

export const fetchQueriesOnDataset = async (): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH}`, { headers });
};
