import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationMap, OperationStepMap } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';

export interface QueryBuilderAction extends Action {
  activeSource?: SourceMap;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  operation?: OperationMap;
  editingStep: boolean;
}
interface State {
  activeSource?: SourceMap;
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
  operation?: OperationMap;
  processing: boolean;
  editingStep: boolean;
}
export type QueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const SET_ACTIVE_SOURCE = `${queryBuilderReducerId}.SET_ACTIVE_SOURCE`;
export const UPDATE_ACTIVE_STEP = `${queryBuilderReducerId}.UPDATE_ACTIVE_STEP`;
export const SET_OPERATION = `${queryBuilderReducerId}.SET_OPERATION`;
export const UPDATE_OPERATION = `${queryBuilderReducerId}.UPDATE_OPERATION`;
export const ADD_OPERATION_STEP = `${queryBuilderReducerId}.ADD_OPERATION_STEP`;
export const SET_OPERATION_STEPS = `${queryBuilderReducerId}.SET_OPERATION_STEPS`;
export const SAVING_OPERATION = `${queryBuilderReducerId}.SAVING_OPERATION`;
export const SAVING_OPERATION_SUCCESS = `${queryBuilderReducerId}.SAVING_OPERATION_SUCCESS`;
export const SAVING_OPERATION_FAILED = `${queryBuilderReducerId}.SAVING_OPERATION_FAILED`;
export const EDIT_OPERATION_STEP = `${queryBuilderReducerId}.EDIT_OPERATION_STEP`;
export const DELETE_OPERATION_STEP = `${queryBuilderReducerId}.DELETE_OPERATION_STEP`;

const defaultState: QueryBuilderState = fromJS({
  activeSource: undefined,
  steps: [],
  activeStep: undefined,
  editingStep: false,
  processing: false
});

export const queryBuilderReducer: Reducer<QueryBuilderState, QueryBuilderAction> = (state = defaultState, action) => {
  if (action.type === SET_ACTIVE_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource);
  }
  if (action.type === UPDATE_ACTIVE_STEP) {
    return state.withMutations(stet => stet.set('activeStep', action.step).set('editingStep', action.editingStep));
  }
  if (action.type === UPDATE_OPERATION || action.type === SET_OPERATION) {
    return state.set('operation', action.operation);
  }
  if (action.type === ADD_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;

    return state.set('steps', steps.push(action.step));
  }
  if (action.type === SET_OPERATION_STEPS) {
    return state.set('steps', action.steps);
  }
  if (action.type === SAVING_OPERATION) {
    return state.set('processing', true);
  }
  if (action.type === SAVING_OPERATION_SUCCESS) {
    return state.withMutations(stet =>
      stet
        .set('processing', false)
        .set('activeSource', undefined)
        .set('activeStep', undefined)
        .set('operation', undefined)
        .set('steps', List())
      );
  }
  if (action.type === SAVING_OPERATION_FAILED) {
    return state.set('processing', false);
  }
  if (action.type === EDIT_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;
    if (steps) {
      const stepIndex = steps.findIndex(step => step.get('step_id') === action.step.get('step_id'));

      return state.withMutations(stet =>
        stet.set('steps', steps.set(stepIndex, action.step)).set('editingStep', false));
    }

    return state;
  }
  if (action.type === DELETE_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;
    if (steps) {
      const stepIndex = steps.findIndex(step => step.get('step_id') === action.step.get('step_id'));
      const updatedSteps = steps.delete(stepIndex).map((step, key) => step.set('step_id', key + 1));

      return state.set('steps', updatedSteps);
    }

    return state;
  }

  return state;
};
