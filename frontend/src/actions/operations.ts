import {
  FETCH_OPERATION,
  FETCH_OPERATIONS,
  FETCH_OPERATION_FAILED,
  OperationsAction,
  SET_ACTIVE_OPERATION
} from '../reducers/operations';
import { OperationMap } from '../types/operations';

interface FetchOptions {
  limit?: number;
  offset?: number;
  link?: string;
}
export const fetchOperations = ({ limit = 10, offset = 0, link }: FetchOptions): Partial<OperationsAction> =>
  ({ type: FETCH_OPERATIONS, payload: { limit, offset, link } });
export const fetchOperation = (id: string): Partial<OperationsAction> => ({ type: FETCH_OPERATION, payload: { id } });
export const setOperation = (activeOperation?: OperationMap, loading = false): Partial<OperationsAction> =>
  ({ type: SET_ACTIVE_OPERATION, activeOperation, loading });
export const fetchOperationFailed = (): Partial<OperationsAction> => ({ type: FETCH_OPERATION_FAILED });
