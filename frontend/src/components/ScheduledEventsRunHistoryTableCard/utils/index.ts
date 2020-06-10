import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import axios from 'axios';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';

const BASEPATH = api.routes.VIEW_SCHEDULED_EVENTS;

export const fetchRunHistory = async (eventId: number): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH}${eventId}/run_instances/`, { headers });
};

export const getScheduledEventsByPage = (
  currentPage: number,
  data: ScheduledEventRunHistory[],
): ScheduledEventRunHistory[] => {
  const begin = (currentPage - 1) * 5;
  const end = begin + 5;

  return data.slice(begin, end);
};
