import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { localForageKeys, api } from '..';
import { FrozenData } from '../../components/SourceHistoryListItem/utils';

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

export const createFrozenData = async (data: FrozenData): Promise<AxiosResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const response = await axios.request({
    url: api.routes.FROZEN_DATA,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });

  return response;
};
