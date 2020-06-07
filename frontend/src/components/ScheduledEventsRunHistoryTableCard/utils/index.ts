import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import axios from 'axios';

const BASEPATH = api.routes.VIEW_SCHEDULED_EVENTS;

export const fetchRunHistory = async (eventId: number): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${BASEPATH}${eventId}/run_instances/`, { headers });
};

export interface RunHistory {
  status: string;
  start_at: string;
  ended_at: string;
}
export interface HistoryData {
  data?: object;
}
