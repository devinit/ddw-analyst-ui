import { List } from 'immutable';
import { OperationDataAPIResponseMap } from '../../../types/operations';
import { FETCH_OPERATION_DATA, FETCH_OPERATION_DATA_FAILED, QueryDataAction, SET_OPERATION_DATA } from '../reducers';

export const fetchOperationData = (id: string): Partial<QueryDataAction> =>
  ({ type: FETCH_OPERATION_DATA, payload: { id } });
export const fetchOperationDataFailed = (): Partial<QueryDataAction> => ({ type: FETCH_OPERATION_DATA_FAILED });
export const setOperationData = (data: List<OperationDataAPIResponseMap>) => ({ type: SET_OPERATION_DATA, data });
