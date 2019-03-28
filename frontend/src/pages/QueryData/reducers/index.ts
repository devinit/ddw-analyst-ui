import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationDataAPIResponseMap, OperationMap } from '../../../types/operations';

export interface QueryDataAction extends Action, State {
  payload: { id: number | string };
}
interface State {
  operation?: OperationMap;
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

const defaultState: QueryDataState = fromJS({ operation: undefined, data: [], loading: false });

export const queryDataReducer: Reducer<QueryDataState, QueryDataAction> = (state = defaultState, action) => {
  if (action.type === SET_OPERATION) {
    return state.set('operation', action.operation).set('loading', false);
  }
  if (action.type === FETCH_OPERATION) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_OPERATION_FAILED) {
    return state.set('loading', false);
  }
  if (action.type === FETCH_OPERATION_DATA) {
    return state.set('loading', true);
  }
  if (action.type === SET_OPERATION_DATA) {
    return state.set('data', action.data).set('loading', false);
  }
  if (action.type === FETCH_OPERATION_DATA_FAILED) {
    return state.set('loading', false);
  }

  return state;
};
