import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { api, localForageKeys } from '..';
import { setToken } from '../../actions/token';
import { FetchOptions } from '../../types/api';
import {
  Operation,
  OperationData,
  OperationDataList,
  OperationMap,
  OperationStep,
} from '../../types/operations';
import { getCachedOperationData } from '../cache';

interface OperationDataHookOptions {
  payload: FetchOptions;
}

interface OperationDataHookResult<T = OperationDataHookOptions> {
  data?: OperationDataList | OperationData[];
  options: T;
  setOptions: Dispatch<SetStateAction<T>>;
  refetch?: (options?: T) => void;
}

interface FetchResponse {
  data?: OperationData[];
  error?: string;
  status: number;
}

interface OperationDataResult {
  count: number;
  results: OperationData[] | [{ error: string }];
}

const BASEURL = api.routes.SINGLE_DATASET;
const PREVIEWBASEURL = api.routes.PREVIEW_SINGLE_DATASET;

const handleDataResult = (status: number, data: OperationDataResult): FetchResponse => {
  if (status === 200 || (status === 201 && data)) {
    return { data: data.results, status };
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

const fetchOperationData = async (payload: FetchOptions): Promise<FetchResponse> => {
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

  return handleDataResult(status, data);
};

export const fetchOperationDataPreview = async (
  operation: Operation,
  steps: OperationStep[],
): Promise<FetchResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const { status, data }: AxiosResponse<OperationDataResult> = await axios
    .request({
      url: PREVIEWBASEURL,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
      data: { ...operation, operation_steps: steps },
    })
    .then((response: AxiosResponse<OperationDataResult>) => response)
    .catch((error) => error.response);

  return handleDataResult(status, data);
};

export const useOperationData = (
  defaultOptions: OperationDataHookOptions,
  fetch = false,
  immutable = true,
): any => {
  const [options, setOptions] = useState(defaultOptions);
  const { payload } = options;
  let status = 'pending',
    error1,
    data1;

  const fetchData = fetchOperationData(payload).then(({ data, error }) => {
    error1 = error || '';
    data1 = immutable ? fromJS(data) : data;
    // update local storage cache
    localForage.setItem(
      `${localForageKeys.DATASET_DATA}-${payload.id}-${payload.limit}-${payload.offset}`,
      JSON.stringify(data1),
    );
    localForage.setItem(
      `${localForageKeys.DATASET_DATA_UPDATED_ON}-${payload.id}-${payload.limit}-${payload.offset}`,
      new Date().toISOString(),
    );
    status = 'done';
  });

  useEffect(() => {
    if (fetch) {
      fetchData;
    } else {
      getCachedOperationData(payload).then(([cachedData, _fetch]) => {
        if (_fetch) {
          fetchData;
        } else {
          data1 = immutable ? fromJS(cachedData) : cachedData;
        }
      });
    }
  }, [payload]);

  return (): OperationDataHookResult => {
    if (status === 'pending') {
      throw fetchData;
    }
    const data = data1;

    return { data, options, setOptions };
  };
};

interface UseOperationResult {
  operation?: Operation | OperationMap;
}

export const useOperation = (id: number, fetch = false, immutable = true): any => {
  let loading = true,
    operation;

  const fetchOperation = () =>
    axios
      .request({
        url: `${api.routes.SINGLE_DATASET}${id}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(({ status, data, statusText }: AxiosResponse<Operation>) => {
        if (status === 200 && data) {
          const activeOperation = data;
          operation = activeOperation;
          loading = false;
        } else if (status === 401) {
          console.log('Failed to fetch operation: ', statusText);
          operation = undefined;
          loading = false;
        }
      })
      .catch((error) => {
        console.log(
          `Failed to fetch operation: ${error.response.status} ${error.response.statusText}`,
        );
        operation = undefined;
        loading = false;
      });

  useEffect(() => {
    if (fetch) {
      fetchOperation();
    } else {
      localForage
        .getItem<Operation | undefined>(localForageKeys.ACTIVE_OPERATION)
        .then((activeOperation) => {
          if (activeOperation && activeOperation.id === id) {
            operation = activeOperation;
            loading = false;
          } else {
            fetchOperation();
          }
        });
    }
  }, [id]);

  return (): UseOperationResult => {
    if (loading) {
      throw fetchOperation();
    }

    return { operation: immutable ? fromJS(operation) : operation };
  };
};
