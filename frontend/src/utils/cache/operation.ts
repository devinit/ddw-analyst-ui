import * as localForage from 'localforage';
import moment from 'moment';
import { localForageKeys } from '..';
import { fetchOperationById } from '../../pages/QueryData/utils';
import { FetchOptions } from '../../types/api';
import { OperationData } from '../../types/operations';

export const getCachedOperationData = async ({
  limit,
  offset,
  id,
}: FetchOptions): Promise<[OperationData[], boolean]> => {
  if (limit && typeof offset === 'number' && id) {
    const cachedData = await localForage.getItem<string>(
      `${localForageKeys.DATASET_DATA}-${limit}-${offset}-${id}`,
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
      if (now.diff(cacheMoment, 'hours') >= 1) {
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
