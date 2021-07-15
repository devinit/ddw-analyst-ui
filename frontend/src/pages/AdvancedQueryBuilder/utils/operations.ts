import axios, { AxiosResponse } from 'axios';
import { Operation, OperationMap } from '../../../types/operations';
import { api, localForageKeys } from '../../../utils';
import { History } from 'history';
import * as localForage from 'localforage';

export const saveOperation = (operation: OperationMap, history: History): void => {
  if (!operation) {
    return;
  }
  const id = operation.get('id');
  const url = id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS;
  const data: Operation = operation.toJS() as Operation;
  localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
    axios
      .request({
        url,
        method: id ? 'put' : 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
        data,
      })
      .then((response: AxiosResponse<Operation>) => {
        if (response.status === 200 || response.status === 201) {
          history.push('/');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
};
