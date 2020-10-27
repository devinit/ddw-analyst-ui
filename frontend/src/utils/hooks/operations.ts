import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { api, localForageKeys } from '..';
import { setToken } from '../../actions/token';
import {
  Operation,
  OperationData,
  OperationDataList,
  OperationMap,
  OperationStep,
} from '../../types/operations';

interface OperationDataHookOptions {
  payload: DatasetDataPayload;
}

interface OperationDataHookResult<T = OperationDataHookOptions> {
  data?: OperationDataList;
  dataLoading: boolean;
  options: T;
  error?: string;
  setOptions: Dispatch<SetStateAction<T>>;
  refetch?: (options?: T) => void;
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
const PREVIEWBASEURL = api.routes.PREVIEW_SINGLE_DATASET;

const handleDataResult = (status: number, data: OperationDataResult): FetchResponse => {
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

interface UseOperationResult {
  operation?: OperationMap;
  loading: boolean;
}

export const useOperation = (id: number, fetch = false): UseOperationResult => {
  const [operation, setOperation] = useState<OperationMap | undefined>(fromJS({}));
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
          const activeOperation = fromJS(data);
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
            setOperation(fromJS(activeOperation));
            setLoading(false);
          } else {
            fetchOperation();
          }
        });
    }
  }, [id]);

  return { loading, operation };
};
