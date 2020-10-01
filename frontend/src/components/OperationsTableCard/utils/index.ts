import axios from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';

interface CsvResponse {
  status: number;
  statusText: string;
  data: Blob;
}

export const exportCsv = async (operationId: number): Promise<CsvResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: `${api.routes.EXPORT}${operationId}/`,
    method: 'post',
    headers: {
      Authorization: `token ${token}`,
    },
    responseType: 'blob',
  });
};
