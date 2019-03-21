import { List, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { SourceMap } from '../../../reducers/sources';
import { OperationStepMap } from '../../../types/query-builder';

export interface QueryBuilderAction extends Action {
  activeSource?: SourceMap;
  step: OperationStepMap;
}
interface State {
  activeSource?: SourceMap;
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
}
export type QueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const SET_ACTIVE_SOURCE = `${queryBuilderReducerId}.SET_ACTIVE_SOURCE`;
export const SET_ACTIVE_STEP = `${queryBuilderReducerId}.SET_ACTIVE_STEP`;
export const ADD_OPERATION_STEP = `${queryBuilderReducerId}.ADD_OPERATION_STEP`;

const defaultState: QueryBuilderState = fromJS({ activeSource: undefined, steps: [], activeStep: undefined });

export const queryBuilderReducer: Reducer<QueryBuilderState, QueryBuilderAction> = (state = defaultState, action) => {
  if (action.type === SET_ACTIVE_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource);
  }
  if (action.type === SET_ACTIVE_STEP) {
    return state.set('activeStep', action.step);
  }
  if (action.type === ADD_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;

    return state.set('steps', steps.push(action.step));
  }

  return state;
};
