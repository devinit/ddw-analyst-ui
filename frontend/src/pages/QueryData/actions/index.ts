import { OperationDataMap, OperationMap } from '../../../types/operations';
import {
  FETCH_OPERATION,
  FETCH_OPERATION_DATA,
  FETCH_OPERATION_DATA_FAILED,
  FETCH_OPERATION_FAILED,
  QueryDataAction,
  SET_OPERATION,
  SET_OPERATION_DATA
} from '../reducers';

export const setOperation = (operation: OperationMap) => ({ type: SET_OPERATION, operation });
export const fetchOperation = (id: string): Partial<QueryDataAction> => ({ type: FETCH_OPERATION, payload: { id } });
export const fetchOperationFailed = (): Partial<QueryDataAction> => ({ type: FETCH_OPERATION_FAILED });
export const fetchOperationData = (id: string): Partial<QueryDataAction> =>
  ({ type: FETCH_OPERATION_DATA, payload: { id } });
export const fetchOperationDataFailed = (): Partial<QueryDataAction> => ({ type: FETCH_OPERATION_DATA_FAILED });
export const setOperationData = (data: OperationDataMap) => ({ type: SET_OPERATION_DATA, data });
