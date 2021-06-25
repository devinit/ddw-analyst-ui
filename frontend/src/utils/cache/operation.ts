import axios from 'axios';
import * as localForage from 'localforage';
import moment from 'moment';
import { localForageKeys } from '..';
import { fetchOperationById } from '../../pages/QueryData/utils';
import { FetchOptions } from '../../types/api';
import { OperationData } from '../../types/operations';
import { OperationDataAPIResponse } from '../../types/operations';

export interface QueryResult {
  data: OperationDataAPIResponse;
}

export const getCachedOperationData = async ({
  limit,
  offset,
  id,
}: FetchOptions): Promise<[OperationData[], boolean]> => {
  if (limit && typeof offset === 'number' && id) {
    const cachedData = await localForage.getItem<string>(
      `${localForageKeys.DATASET_DATA}-${id}-${limit}-${offset}`,
    );
    const expiredCache: boolean = await isOperationDataCacheExpired({ limit, offset, id });

    return cachedData && !expiredCache ? [JSON.parse(cachedData), false] : [[], true];
  }

  return [[], true];
};

export const isOperationDataCacheExpired = async ({
  limit,
  offset,
  id,
}: FetchOptions): Promise<boolean> => {
  if (limit && typeof offset === 'number' && id) {
    const cacheKey = `${localForageKeys.DATASET_DATA_UPDATED_ON}-${id}-${limit}-${offset}`;
    const cachedDataUpdatedTime = await localForage.getItem<string>(cacheKey);
    if (cachedDataUpdatedTime) {
      // is cache older than an hour?
      const cacheMoment = moment(cachedDataUpdatedTime);
      const now = moment(new Date());
      if (now.diff(cacheMoment, 'minutes') >= 10) {
        return true;
      }
      // has the dataset been updated?
      const { data } = await fetchOperationById(id);
      if (moment(data.updated_on).isAfter(cachedDataUpdatedTime)) {
        localForage.setItem(cacheKey, data.updated_on);

        return true;
      }

      return false;
    }
  }

  return true;
};

export const fetchOperations = async (path: string): Promise<QueryResult> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(path, { headers });
};

export const isOperationsCacheExpired = async (
  dataCountkey: string,
  cacheDatasets: string,
  path: string,
): Promise<boolean> => {
  const cachedDataCount: number | null = await localForage.getItem<number>(dataCountkey);
  const cacheData = JSON.parse(cacheDatasets);
  if (cachedDataCount) {
    const { data } = await fetchOperations(path);
    if (
      data.count > cachedDataCount ||
      JSON.stringify(cacheData.results) !== JSON.stringify(data.results)
    ) {
      localForage.setItem(dataCountkey, data.count);

      return true;
    }
  }

  return false;
};
