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
  dataLoading: boolean;
  options: T;
  error?: string;
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
): OperationDataHookResult => {
  const [dataLoading, setDataLoading] = useState(true);
  const [options, setOptions] = useState(defaultOptions);
  const [data, setData] = useState<OperationDataList>();
  const [error, setError] = useState('');
  const { payload } = options;

  const fetchData = () => {
    fetchOperationData(payload).then(({ data, error }) => {
      setError(error || '');
      setData(immutable ? fromJS(data) : data);
      // update local storage cache
      localForage.setItem(
        `${localForageKeys.DATASET_DATA}-${payload.id}-${payload.limit}-${payload.offset}`,
        JSON.stringify(data),
      );
      localForage.setItem(
        `${localForageKeys.DATASET_DATA_UPDATED_ON}-${payload.id}-${payload.limit}-${payload.offset}`,
        new Date().toISOString(),
      );
      setDataLoading(false);
    });
  };

  useEffect(() => {
    if (!dataLoading) {
      setDataLoading(true);
    }
    if (fetch) {
      fetchData();
    } else {
      getCachedOperationData(payload).then(([cachedData, _fetch]) => {
        if (_fetch) {
          fetchData();
        } else {
          setData(immutable ? fromJS(cachedData) : cachedData);
          setDataLoading(false);
        }
      });
    }
  }, [payload]);

  return { data, dataLoading, options, error, setOptions };
};

interface UseOperationResult<O = Operation | OperationMap> {
  operation?: O;
  loading: boolean;
}

export const useOperation = <O = Operation | OperationMap>(
  id?: number,
  fetch = false,
  immutable = true,
): UseOperationResult<O> => {
  if (!id) {
    return { loading: false, operation: undefined };
  }
  const [operation, setOperation] = useState<Operation | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchOperation = () => {
    setLoading(true);
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
          setOperation(activeOperation);
          setLoading(false);
        } else if (status === 401) {
          console.log('Failed to fetch operation: ', statusText);
          setOperation(undefined);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(
          `Failed to fetch operation: ${error.response.status} ${error.response.statusText}`,
        );
        setOperation(undefined);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (fetch) {
      fetchOperation();
    } else {
      localForage
        .getItem<Operation | undefined>(localForageKeys.ACTIVE_OPERATION)
        .then((activeOperation) => {
          if (activeOperation && activeOperation.id === id) {
            setOperation(activeOperation);
            setLoading(false);
          } else {
            fetchOperation();
          }
        });
    }
  }, [id]);

  return { loading, operation: immutable ? fromJS(operation) : operation };
};

interface UseOperationQueryResult {
  query?: string;
  loading: boolean;
}

export const useOperationQuery = (operation?: OperationMap): UseOperationQueryResult => {
  const [token, setAPIToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
      if (token) setAPIToken(token);
    });
  }, []);

  const fetchOperationQuery = (operation: OperationMap) => {
    setLoading(true);
    const config = operation.get('advanced_config');
    if (config && token) {
      axios
        .request({
          url: `${api.routes.DATASET_QUERY}`,
          method: 'post',
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}`,
          },
          data: { config: (config as any).toJS() },
        })
        .then(({ status, data, statusText }: AxiosResponse<{ query: string }>) => {
          if (status === 200 && data) {
            setQuery(data.query);
            setLoading(false);
          } else if (status === 401) {
            console.log('Failed to generate SQL query: ', statusText);
            setQuery('');
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(
            `Failed to generate SQL query: ${error.response.status} ${error.response.statusText}`,
          );
          setQuery('');
          setLoading(false);
        });
    } else {
      // TODO: implement for basic QB as well
      setLoading(false);
      setQuery('');
    }
  };

  useEffect(() => {
    if (operation && token) {
      fetchOperationQuery(operation);
    } else {
      setLoading(false);
      setQuery('');
    }
  }, [operation, token]);

  return { loading, query };
};
