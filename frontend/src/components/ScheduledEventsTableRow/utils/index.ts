import axios from 'axios';
import * as localForage from 'localforage';
import { Moment } from 'moment';
import { api, localForageKeys } from '../../../utils';

interface RunInstancePayload {
  start_at: Moment;
  status: string;
}

interface RunInstance {
  scheduled_event: number;
  start_at: string;
  ended_at: string | undefined | null;
  status: string;
}

interface ServerResponse {
  error: string;
  success: string;
  result: RunInstance[];
}

interface RunInstanceResponse {
  status: number;
  statusText: string;
  data: ServerResponse;
}

export const createRunInstance = async (
  scheduleId: number,
  data: RunInstancePayload,
): Promise<RunInstanceResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: api.routes.CREATE_SCHEDULED_INSTANCE.replace('{scheduleId}', `${scheduleId}`),
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });
};

const intervalType: { [char: string]: string } = {
  min: 'Minutes',
  sec: 'Seconds',
  hrs: 'Hours',
  dys: 'Days',
  wks: 'Weeks',
  mnt: 'Months',
  yrs: 'Years',
};

export const convertIntervalType = (value: string): string | undefined => {
  for (const key in intervalType) {
    if (key === value) {
      return intervalType[key];
    }
  }
};
