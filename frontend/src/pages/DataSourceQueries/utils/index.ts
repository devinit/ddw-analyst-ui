import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';

const BASEPATH = api.routes.FETCH_SOURCE_DATASETS;

export interface ResultData {
  id: number;
  name: string;
  updated_on: string;
  is_draft: boolean;
  operation_query: string;
}

export interface QueryResult {
  data: Array<ResultData>;
}

export const fetchQueriesOnDataset = async (id: number): Promise<QueryResult> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH.replace('{id}', id.toString())}`, { headers });
};
