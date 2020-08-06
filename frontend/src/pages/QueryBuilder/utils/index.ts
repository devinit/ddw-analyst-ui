import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '../../../utils';
import { OperationStep, OperationStepMap } from '../../../types/operations';
import { List } from 'immutable';

export interface Operation {
  id: number;
  name: string;
  description: string;
  operation_query: string;
  theme: string;
  operation_steps: OperationStep[] | List<OperationStepMap>;
  is_draft: boolean;
}

interface Dataset {
  [key: string]: string | number;
}

interface DatasetPreview {
  results: Dataset[];
}

interface PreviewServerResponse {
  status: number;
  statusText: string;
  data: DatasetPreview;
}

export const saveOperation = async (
  id: string | number | boolean | OperationStep[] | List<OperationStepMap> | undefined,
  data: Operation,
): Promise<AxiosResponse<Operation>> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS,
    method: id ? 'put' : 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });
};

export const previewOperation = async (data: Operation): Promise<PreviewServerResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: `${api.routes.PREVIEW_SINGLE_DATASET}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });
};
