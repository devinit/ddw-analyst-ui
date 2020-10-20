import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';

const BASEPATH = api.routes.FETCH_SOURCE_HISTORY;

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

interface FetchOptions {
  limit?: number;
  offset?: number;
}

export const fetchDataSourceHistory = async (
  id: number,
  options: FetchOptions = { limit: 10, offset: 0 },
): Promise<QueryResult> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(
    `${BASEPATH}${id}?limit=${options.limit || 10}&offset=${options.offset || 0}`,
    { headers },
  );
};
