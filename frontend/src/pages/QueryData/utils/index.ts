import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import moment from 'moment';

const BASEPATH = api.routes.FETCH_OPERATION;

export interface ResultData {
  id: number;
  name: string;
  updated_on: string;
  is_draft: boolean;
  alias_creation_status: string;
  estimated_run_time: number;
}

export interface QueryResult {
  data: ResultData;
}

export const fetchOperationById = async (id: number): Promise<QueryResult> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH.replace('{id}', id.toString())}`, { headers });
};

export const isCacheExpired = async (id: number): Promise<boolean> => {
  const cachedOperationUpdatedTime = await localForage.getItem<string>(
    `${localForageKeys.DATASET_UPDATED_ON}-${id}`,
  );
  if (cachedOperationUpdatedTime) {
    const { data } = await fetchOperationById(id);
    if (moment(data.updated_on).isAfter(cachedOperationUpdatedTime)) {
      localForage.setItem(`${localForageKeys.DATASET_UPDATED_ON}-${id}`, data.updated_on);

      return true;
    }
  }

  return false;
};
