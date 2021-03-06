import { History } from 'history';
import {
  DELETE_OPERATION,
  DELETE_OPERATION_FAILED,
  DELETE_OPERATION_SUCCESSFUL,
  FETCH_OPERATION,
  FETCH_OPERATIONS,
  FETCH_OPERATION_FAILED,
  OperationsAction,
  SET_ACTIVE_OPERATION,
} from '../reducers/operations';
import { FetchOptions } from '../types/api';
import { OperationMap } from '../types/operations';

type FetchArgs = FetchOptions & { mine?: boolean };

export const fetchOperations = ({
  limit = 10,
  offset = 0,
  link,
  mine = false,
  search = '',
}: FetchArgs): Partial<OperationsAction> => ({
  type: FETCH_OPERATIONS,
  payload: { limit, offset, link, search, mine },
});
export const fetchOperation = (id: string): Partial<OperationsAction> => ({
  type: FETCH_OPERATION,
  payload: { id },
});
export const fetchOperationFailed = (): Partial<OperationsAction> => ({
  type: FETCH_OPERATION_FAILED,
});
export const setOperation = (
  activeOperation?: OperationMap,
  loading = false,
): Partial<OperationsAction> => ({ type: SET_ACTIVE_OPERATION, activeOperation, loading });
export const deleteOperation = (id: string, history: History): Partial<OperationsAction> => ({
  type: DELETE_OPERATION,
  payload: { id, history },
});
export const deleteOperationFailed = (): Partial<OperationsAction> => ({
  type: DELETE_OPERATION_FAILED,
});
export const deleteOperationSuccess = (): Partial<OperationsAction> => ({
  type: DELETE_OPERATION_SUCCESSFUL,
});
