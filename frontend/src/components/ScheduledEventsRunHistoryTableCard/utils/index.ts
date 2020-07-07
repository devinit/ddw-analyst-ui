import axios from 'axios';
import * as localForage from 'localforage';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { api, localForageKeys } from '../../../utils';

export const LIMIT = 10;
const BASEPATH = api.routes.FETCH_RUN_INSTANCES;

export const fetchScheduledEventRunHistory = async (
  eventId: number,
): Promise<{ data: ScheduledEventRunHistory[] }> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH.replace('{id}', eventId.toString())}`, { headers });
};

export const fetchDataPerPage = async (
  eventId: number,
  limit: number,
  currentPage = 1,
  status = '',
): Promise<{
  data: {
    results: ScheduledEventRunHistory[];
    count: number;
  };
}> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };
  const offset = currentPage === 1 ? 0 : (currentPage - 1) * limit;

  return await axios(
    `${BASEPATH.replace(
      '{id}',
      eventId.toString(),
    )}?limit=${limit}&offset=${offset}&status=${status}`,
    { headers },
  );
};
