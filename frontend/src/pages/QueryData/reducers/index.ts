import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationDataAPIResponseMap } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';

export interface QueryDataAction extends Action, State {
  payload: { id: number | string; limit: number; offset: number };
}
interface State {
  source?: SourceMap;
  loading: boolean;
  data: List<OperationDataAPIResponseMap>;
  limit: number;
  offset: number;
  alert: string;
}
export type QueryDataState = Map<keyof State, State[keyof State]>;

export const queryDataReducerId = 'pages/QueryData';
export const SET_OPERATION_DATA = `${queryDataReducerId}.SET_DATA`;
export const FETCH_OPERATION_DATA = `${queryDataReducerId}.FETCH_DATA`;
export const FETCH_OPERATION_DATA_FAILED = `${queryDataReducerId}.FETCH_DATA_FAILED`;

const defaultState: QueryDataState = fromJS({ data: [], loading: false, limit: 10, offset: 0 });

export const queryDataReducer: Reducer<QueryDataState, QueryDataAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === FETCH_OPERATION_DATA) {
    return state.set('loading', true);
  }
  if (action.type === SET_OPERATION_DATA && action.payload) {
    return state.withMutations((stet) =>
      stet
        .set('data', action.data)
        .set('loading', false)
        .set('limit', action.payload.limit)
        .set('offset', action.payload.offset),
    );
  }
  if (action.type === FETCH_OPERATION_DATA_FAILED) {
    return state.set('loading', false).set('alert', action.alert);
  }

  return state;
};
