import { Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationMap } from '../../../types/operations';

export interface AdvancedQueryBuilderAction extends Action {
  operation?: OperationMap;
}
interface State {
  processing: boolean;
}
export type AdvancedQueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const SAVING_OPERATION = `${queryBuilderReducerId}.SAVING_OPERATION`;
export const SAVING_OPERATION_SUCCESS = `${queryBuilderReducerId}.SAVING_OPERATION_SUCCESS`;
export const SAVING_OPERATION_FAILED = `${queryBuilderReducerId}.SAVING_OPERATION_FAILED`;
export const DELETE_OPERATION_STEP = `${queryBuilderReducerId}.DELETE_OPERATION_STEP`;
export const RESET_STATE = `${queryBuilderReducerId}.RESET_STATE`;

const defaultState: AdvancedQueryBuilderState = fromJS({
  processing: false,
});

export const queryBuilderReducer: Reducer<AdvancedQueryBuilderState, AdvancedQueryBuilderAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === SAVING_OPERATION) {
    return state.set('processing', true);
  }
  if (action.type === SAVING_OPERATION_SUCCESS) {
    return state.withMutations((stet) => stet.set('processing', false));
  }
  if (action.type === SAVING_OPERATION_FAILED) {
    return state.set('processing', false);
  }
  if (action.type === RESET_STATE) {
    return defaultState;
  }

  return state;
};
