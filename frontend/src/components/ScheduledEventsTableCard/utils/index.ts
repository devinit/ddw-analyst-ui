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
    scheduled_events: ScheduledEvent[];
    count_scheduled_events: number;
  };
}> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const options = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
  };

  return await axios.post(`${BASEPATH}`, { limit, currentPage }, options);
};
