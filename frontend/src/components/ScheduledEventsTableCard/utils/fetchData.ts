import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import axios from 'axios';

const BasePath = api.routes.VIEW_SCHEDULED_EVENTS;

export const fetchData = async (): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };
  const result = await axios(`${BasePath}`, { headers });

  return result;
};
