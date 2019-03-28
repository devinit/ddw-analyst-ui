import { OperationMap } from '../../../types/operations';
import { FETCH_OPERATION, FETCH_OPERATION_FAILED, QueryDataAction, SET_OPERATION } from '../reducers';

export const setOperation = (operation: OperationMap) => ({ type: SET_OPERATION, operation });
export const fetchOperation = (id: string): QueryDataAction => ({ type: FETCH_OPERATION, payload: { id } });
export const fetchOperationFailed = (): Partial<QueryDataAction> => ({ type: FETCH_OPERATION_FAILED });
