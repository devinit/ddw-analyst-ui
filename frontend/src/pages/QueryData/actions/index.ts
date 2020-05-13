import { List } from 'immutable';
import { OperationDataAPIResponseMap } from '../../../types/operations';
import {
  FETCH_OPERATION_DATA,
  FETCH_OPERATION_DATA_FAILED,
  QueryDataAction,
  SET_OPERATION_DATA,
} from '../reducers';
import { FetchOptions } from '../../../types/api';

type FetchOptionsWithId = FetchOptions & { id: string };

export const fetchOperationData = ({
  limit = 10,
  offset = 0,
  id,
}: FetchOptionsWithId): Partial<QueryDataAction> => ({
  type: FETCH_OPERATION_DATA,
  payload: { id, limit, offset },
});
export const fetchOperationDataFailed = (alert: string): Partial<QueryDataAction> => ({
  type: FETCH_OPERATION_DATA_FAILED,
  alert,
});
export const setOperationData = (
  data: List<OperationDataAPIResponseMap>,
  payload: FetchOptions,
) => ({ type: SET_OPERATION_DATA, data, payload });
