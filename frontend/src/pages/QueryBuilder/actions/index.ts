import { SourceMap } from '../../../reducers/sources';
import { OperationStepMap } from '../../../types/query-builder';
import { ADD_OPERATION_STEP, QueryBuilderAction, SET_ACTIVE_SOURCE, SET_ACTIVE_STEP } from '../reducers';

export const setActiveSource = (activeSource: SourceMap): Partial<QueryBuilderAction> =>
  ({ type: SET_ACTIVE_SOURCE, activeSource });

export const setActiveStep = (step?: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: SET_ACTIVE_STEP, step });
export const addFilter = (step: OperationStepMap): Partial<QueryBuilderAction> =>
  ({ type: ADD_OPERATION_STEP, step });
