import { Operation, OperationMap } from '../../../types/operations';
import { api } from '../../../utils';
import { clearOperationsCache } from '../../../utils/cache';
import axiosConfig from '../../../config';

export const saveOperation = async (operation: OperationMap, token: string): Promise<void> => {
  if (!operation) {
    return;
  }
  const id = operation.get('id');
  const url = id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS;
  const data: Operation = operation.toJS() as unknown as Operation;
  const response = await axiosConfig.request<Operation>({
    url,
    method: id ? 'put' : 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });
  if (response.status === 200 || response.status === 201) {
    clearOperationsCache();
  }

  return;
};

export const deleteOperation = async (operationID: string, token: string): Promise<void> => {
  const response = await axiosConfig.request({
    url: `${api.routes.SINGLE_DATASET}${operationID}/`,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
  });

  if (response.status === 200 || response.status === 204 || response.status === 201) {
    clearOperationsCache();

    return;
  }

  throw new Error(
    `Operation delete failed: Code: ${response.status} | Message: ${response.statusText}`,
  );
};
