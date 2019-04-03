import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationDataAPIResponseMap, OperationMap } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';

export interface QueryDataAction extends Action, State {
  payload: { id: number | string };
}
interface State {
  operation?: OperationMap;
  source?: SourceMap;
  loading: boolean;
  data: List<OperationDataAPIResponseMap>;
}
export type QueryDataState = Map<keyof State, State[keyof State]>;

export const queryDataReducerId = 'pages/QueryData';
export const SET_OPERATION = `${queryDataReducerId}.SET_OPERATION`;
export const FETCH_OPERATION = `${queryDataReducerId}.FETCH_OPERATION`;
export const FETCH_OPERATION_FAILED = `${queryDataReducerId}.FETCH_FAILED`;
export const SET_OPERATION_DATA = `${queryDataReducerId}.SET_DATA`;
export const FETCH_OPERATION_DATA = `${queryDataReducerId}.FETCH_DATA`;
export const FETCH_OPERATION_DATA_FAILED = `${queryDataReducerId}.FETCH_DATA_FAILED`;
export const SET_SOURCE = `${queryDataReducerId}.SET_SOURCE`;
export const FETCH_SOURCE = `${queryDataReducerId}.FETCH_SOURCE`;

const defaultState: QueryDataState = fromJS({ operation: undefined, data: [], loading: false });

export const queryDataReducer: Reducer<QueryDataState, QueryDataAction> = (state = defaultState, action) => {
  if (action.type === SET_OPERATION) {
    return state.set('operation', action.operation).set('loading', action.loading);
  }
  if (action.type === FETCH_OPERATION || action.type === FETCH_OPERATION_DATA || action.type === FETCH_SOURCE) {
    return state.set('loading', true);
  }
  if (action.type === SET_OPERATION_DATA) {
    return state.set('data', action.data).set('loading', false);
  }
  if (action.type === FETCH_OPERATION_FAILED || action.type === FETCH_OPERATION_DATA_FAILED) {
    return state.set('loading', false);
  }
  if (action.type === SET_SOURCE) {
    return state.set('source', action.source).set('loading', action.loading);
  }

  return state;
};
