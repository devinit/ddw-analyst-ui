import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';

interface ServerResponse {
  id: number;
  indicator: string;
  indicator_acronym: string;
  source: string;
}

interface SourcesResponse {
  status: number;
  statusText: string;
  data: ServerResponse;
}

export const fetchSource = async (sourceId: number): Promise<SourcesResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: api.routes.SINGLE_SOURCE.replace('{sourceId}', `${sourceId}`),
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
  });
};
