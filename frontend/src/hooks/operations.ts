import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { useEffect, useState } from 'react';
import { Operation, OperationMap } from '../types/operations';
import { api, localForageKeys } from '../utils';

interface UseOperationResult {
  operation?: OperationMap;
  loading: boolean;
}

export const useOperation = (id?: number, fetch = false): UseOperationResult => {
  if (!id) {
    return { loading: false, operation: undefined };
  }
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
