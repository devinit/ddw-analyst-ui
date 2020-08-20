import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { api, localForageKeys } from '..';
import { setToken } from '../../actions/token';
import { OperationData, OperationDataList } from '../../types/operations';

interface OperationDataHookOptions {
  payload: DatasetDataPayload;
  preview?: boolean;
}

interface OperationDataHookResult {
  data?: OperationDataList;
  dataLoading: boolean;
  options: OperationDataHookOptions;
  error?: string;
  setOptions: Dispatch<SetStateAction<OperationDataHookOptions>>;
  refetch?: (options?: OperationDataHookOptions) => void;
}

interface DatasetDataPayload {
  limit: number;
  offset: number;
  id: string;
}

interface FetchResponse {
  data?: OperationDataList;
  error?: string;
  status: number;
}

interface OperationDataResult {
  count: number;
  results: OperationData[] | [{ error: string }];
}

const BASEURL = api.routes.SINGLE_DATASET;
// const PREVIEWBASEURL = api.routes.PREVIEW_SINGLE_DATASET;

const fetchOperationData = async (payload: DatasetDataPayload): Promise<FetchResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const { status, data }: AxiosResponse<OperationDataResult> = await axios
    .request({
      url: `${BASEURL}data/${payload.id}/?limit=${payload.limit}&offset=${payload.offset}`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
    })
    .then((response: AxiosResponse<OperationDataResult>) => response)
    .catch((error) => error.response);

  if (status === 200 || (status === 201 && data)) {
    return { data: fromJS(data.results), status };
  } else if (status === 401) {
    setToken('');

    return { status, error: 'invalid token' };
  } else if (data.results && data.results.length && data.results[0].error) {
    return { status, error: data.results[0].error as string };
  }

  return {
    status,
    error: 'An error occurred while executing query. Please contact your system administrator',
  };
};

export const useOperationData = (
  defaultOptions: OperationDataHookOptions,
): OperationDataHookResult => {
  const [dataLoading, setDataLoading] = useState(true);
  const [options, setOptions] = useState(defaultOptions);
  const [data, setData] = useState<OperationDataList>();
  const [error, setError] = useState('');
  const { payload } = options;
  useEffect(() => {
    if (!dataLoading) {
      setDataLoading(true);
    }
    fetchOperationData(payload).then(({ data, error }) => {
      setError(error || '');
      setData(data);
      setDataLoading(false);
    });
  }, [payload]);

  return { data, dataLoading, options, error, setOptions };
};
