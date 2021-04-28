import axios from 'axios';
import * as localForage from 'localforage';
import { localForageKeys } from '.';
import { OperationDataAPIResponse } from '../types/operations';

export interface QueryResult {
  data: OperationDataAPIResponse;
}

export const fetchOperations = async (path: string): Promise<QueryResult> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(path, { headers });
};

export const isDatasetCacheExpired = async (key: string, path: string): Promise<boolean> => {
  const cachedDataCount: number | null = await localForage.getItem<number>(key);
  if (cachedDataCount) {
    const { data } = await fetchOperations(path);
    if (data.count > cachedDataCount) {
      localForage.setItem(key, data.count);

      return true;
    }
  }

  return false;
};
