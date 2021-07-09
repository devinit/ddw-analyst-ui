import {
  AdvancedQueryBuilderAction,
  RESET_STATE,
  SAVING_OPERATION,
  SAVING_OPERATION_FAILED,
  SAVING_OPERATION_SUCCESS,
} from '../reducers';

export const savingOperation = (): Partial<AdvancedQueryBuilderAction> => ({
  type: SAVING_OPERATION,
});
export const operationSaved = (saved: boolean): Partial<AdvancedQueryBuilderAction> =>
  saved ? { type: SAVING_OPERATION_SUCCESS } : { type: SAVING_OPERATION_FAILED };
export const resetQueryBuilderState = (): Partial<AdvancedQueryBuilderAction> => ({
  type: RESET_STATE,
});
