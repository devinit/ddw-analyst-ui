import axios from 'axios';
import * as localForage from 'localforage';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { api, localForageKeys } from '../../../utils';

export const LIMIT = 10;
const BASEPATH = api.routes.FETCH_RUN_INSTANCES;

export const fetchRunHistory = async (
  eventId: number,
): Promise<{ data: ScheduledEventRunHistory[] }> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH.replace('{id}', eventId.toString())}`, { headers });
};

export const getScheduledEventRunHistoryByPage = (
  currentPage: number,
  data: ScheduledEventRunHistory[],
): ScheduledEventRunHistory[] => {
  const begin = (currentPage - 1) * LIMIT;
  const end = begin + LIMIT;

  return data.slice(begin, end);
};
