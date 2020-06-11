import axios from 'axios';
import * as localForage from 'localforage';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { api, localForageKeys } from '../../../utils';
import { LIMIT } from '../../ScheduledEventsTableCard';

const BASEPATH = api.routes.FETCH_RUN_INSTANCES;

export const fetchRunHistory = async (eventId: number): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH.replace('{id}', eventId.toString())}`, { headers });
};

export const getScheduledEventsByPage = (
  currentPage: number,
  data: ScheduledEventRunHistory[],
): ScheduledEventRunHistory[] => {
  const begin = (currentPage - 1) * 5;
  const end = begin + LIMIT;

  return data.slice(begin, end);
};
