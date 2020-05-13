import { FETCH_OPERATIONS_FAILED, FETCH_OPERATIONS_SUCCESSFUL } from '../../../reducers/operations';
import { Operation } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';
import { DataSourcesAction, SET_ACTIVE_SOURCE } from '../reducers';

export const setActiveSource = (activeSource: SourceMap): DataSourcesAction => ({
  type: SET_ACTIVE_SOURCE,
  activeSource,
});
export const onFetchOperationsSuccessful = (operations: Operation[], count: number) => ({
  type: FETCH_OPERATIONS_SUCCESSFUL,
  operations,
  count,
});
export const onFetchOperationsFailed = () => ({ type: FETCH_OPERATIONS_FAILED });
