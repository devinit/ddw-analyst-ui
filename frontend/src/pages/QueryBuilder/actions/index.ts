import { OperationMap, OperationStepMap } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';
import {
  ADD_OPERATION_STEP,
  QueryBuilderAction,
  SAVING_OPERATION,
  SAVING_OPERATION_FAILED,
  SAVING_OPERATION_SUCCESS,
  SET_ACTIVE_SOURCE,
  UPDATE_ACTIVE_STEP,
  UPDATE_OPERATION
} from '../reducers';

export const setActiveSource = (activeSource: SourceMap): Partial<QueryBuilderAction> =>
  ({ type: SET_ACTIVE_SOURCE, activeSource });

export const updateActiveStep = (step?: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: UPDATE_ACTIVE_STEP, step });
export const updateOperation = (operation?: OperationMap): Partial<QueryBuilderAction> =>
  ({ type: UPDATE_OPERATION, operation });
export const addOperationStep = (step: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: ADD_OPERATION_STEP, step });
export const savingOperation = (): Partial<QueryBuilderAction> => ({ type: SAVING_OPERATION });
export const operationSaved = (saved: boolean): Partial<QueryBuilderAction> =>
  saved ? ({ type: SAVING_OPERATION_SUCCESS }) : ({ type: SAVING_OPERATION_FAILED });
