import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import axios from 'axios';

const BASEPATH = api.routes.VIEW_SCHEDULED_EVENTS;
export const LIMIT = 5;

export const fetchData = async (): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH}`, { headers });
};

export const getScheduledEventsByPage = (currentPage: number, data: object): Array<[]> => {
  const begin = (currentPage - 1) * 5;
  const end = begin + 5;

  return data.data.slice(begin, end);
};
