import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { OperationMap, OperationStepMap } from '../../../types/operations';

export interface QueryBuilderAction extends Action {
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  operation?: OperationMap;
  editingStep: boolean;
}
interface State {
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
  processing: boolean;
  editingStep: boolean;
}
export type QueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const UPDATE_ACTIVE_STEP = `${queryBuilderReducerId}.UPDATE_ACTIVE_STEP`;
export const ADD_OPERATION_STEP = `${queryBuilderReducerId}.ADD_OPERATION_STEP`;
export const SET_OPERATION_STEPS = `${queryBuilderReducerId}.SET_OPERATION_STEPS`;
export const SAVING_OPERATION = `${queryBuilderReducerId}.SAVING_OPERATION`;
export const SAVING_OPERATION_SUCCESS = `${queryBuilderReducerId}.SAVING_OPERATION_SUCCESS`;
export const SAVING_OPERATION_FAILED = `${queryBuilderReducerId}.SAVING_OPERATION_FAILED`;
export const EDIT_OPERATION_STEP = `${queryBuilderReducerId}.EDIT_OPERATION_STEP`;
export const DELETE_OPERATION_STEP = `${queryBuilderReducerId}.DELETE_OPERATION_STEP`;
export const RESET_STATE = `${queryBuilderReducerId}.RESET_STATE`;

const defaultState: QueryBuilderState = fromJS({
  steps: [],
  activeStep: undefined,
  editingStep: false,
  processing: false,
}) as QueryBuilderState;

export const queryBuilderReducer: Reducer<QueryBuilderState, QueryBuilderAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === UPDATE_ACTIVE_STEP) {
    return state.withMutations((stet) =>
      stet.set('activeStep', action.step).set('editingStep', action.editingStep),
    );
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
    return state.withMutations((stet) =>
      stet.set('processing', false).set('activeStep', undefined).set('steps', List()),
    );
  }
  if (action.type === SAVING_OPERATION_FAILED) {
    return state.set('processing', false);
  }
  if (action.type === EDIT_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;
    if (steps) {
      const stepIndex = steps.findIndex(
        (step) => step.get('step_id') === action.step.get('step_id'),
      );

      return state.withMutations((stet) =>
        stet.set('steps', steps.set(stepIndex, action.step)).set('editingStep', false),
      );
    }

    return state;
  }
  if (action.type === DELETE_OPERATION_STEP) {
    const steps = state.get('steps') as List<OperationStepMap>;
    if (steps) {
      const stepIndex = steps.findIndex(
        (step) => step.get('step_id') === action.step.get('step_id'),
      );
      const updatedSteps = steps.delete(stepIndex).map((step, key) => step.set('step_id', key + 1));

      return state.set('steps', updatedSteps);
    }

    return state;
  }
  if (action.type === RESET_STATE) {
    return defaultState;
  }

  return state;
};
