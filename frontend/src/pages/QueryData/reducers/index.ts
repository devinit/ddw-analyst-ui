import { Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationMap } from '../../../types/operations';

export interface QueryDataAction extends Action {
  operation?: OperationMap;
}
interface State {
  operation?: OperationMap;
}
export type QueryDataState = Map<keyof State, State[keyof State]>;

export const queryDataReducerId = 'pages/QueryData';
export const SET_OPERATION = `${queryDataReducerId}.SET_OPERATION`;

const defaultState: QueryDataState = fromJS({ operation: undefined });

export const queryDataReducer: Reducer<QueryDataState, QueryDataAction> = (state = defaultState, action) => {
  if (action.type === SET_OPERATION) {
    return state.set('operation', action.operation);
  }

  return state;
};
