import axios from 'axios';
import * as localForage from 'localforage';
import { ScheduledEvent } from '../../../types/scheduledEvents';
import { api, localForageKeys } from '../../../utils';

const BASEPATH = api.routes.VIEW_SCHEDULED_EVENTS;

export const LIMIT = 5;

export const fetchData = async (): Promise<{ data: ScheduledEvent[] }> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH}`, { headers });
};

export const fetchDataPerPage = async (
  limit: number,
  currentPage: number,
): Promise<{
  data: {
    results: ScheduledEvent[];
    count: number;
  };
}> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };
  const offset = currentPage === 1 ? 0 : (currentPage - 1) * limit;

  return await axios(`${BASEPATH}?limit=${limit}&offset=${offset}`, { headers });
};
