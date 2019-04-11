import { OperationStepMap } from '../../../types/operations';
import {
  ADD_OPERATION_STEP,
  DELETE_OPERATION_STEP,
  EDIT_OPERATION_STEP,
  QueryBuilderAction,
  SAVING_OPERATION,
  SAVING_OPERATION_FAILED,
  SAVING_OPERATION_SUCCESS,
  UPDATE_ACTIVE_STEP
} from '../reducers';

export const updateActiveStep = (step?: OperationStepMap, editingStep = false): Partial<QueryBuilderAction> =>
  ({ type: UPDATE_ACTIVE_STEP, step, editingStep });
export const addOperationStep = (step: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: ADD_OPERATION_STEP, step });
export const editOperationStep = (step: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: EDIT_OPERATION_STEP, step });
export const deleteOperationStep = (step: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: DELETE_OPERATION_STEP, step });
export const savingOperation = (): Partial<QueryBuilderAction> => ({ type: SAVING_OPERATION });
export const operationSaved = (saved: boolean): Partial<QueryBuilderAction> =>
  saved ? ({ type: SAVING_OPERATION_SUCCESS }) : ({ type: SAVING_OPERATION_FAILED });
