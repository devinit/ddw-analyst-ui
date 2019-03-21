import { List, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { SourceMap } from '../../../reducers/sources';
import { OperationMap, OperationStepMap } from '../../../types/query-builder';

export interface QueryBuilderAction extends Action {
  activeSource?: SourceMap;
  step: OperationStepMap;
  operation?: OperationMap;
}
interface State {
  activeSource?: SourceMap;
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
  operation?: OperationMap;
}
export type QueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const SET_ACTIVE_SOURCE = `${queryBuilderReducerId}.SET_ACTIVE_SOURCE`;
export const UPDATE_ACTIVE_STEP = `${queryBuilderReducerId}.UPDATE_ACTIVE_STEP`;
export const UPDATE_OPERATION = `${queryBuilderReducerId}.UPDATE_OPERATION`;
export const ADD_OPERATION_STEP = `${queryBuilderReducerId}.ADD_OPERATION_STEP`;

const defaultState: QueryBuilderState = fromJS({ activeSource: undefined, steps: [], activeStep: undefined });

export const queryBuilderReducer: Reducer<QueryBuilderState, QueryBuilderAction> = (state = defaultState, action) => {
  if (action.type === SET_ACTIVE_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource);
  }
  if (action.type === UPDATE_ACTIVE_STEP) {
    return state.set('activeStep', action.step);
  }
  if (action.type === UPDATE_OPERATION) {
    return state.set('operation', action.operation);
  }
  if (action.type === ADD_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;

    return state.set('steps', steps.push(action.step));
  }

  return state;
};
