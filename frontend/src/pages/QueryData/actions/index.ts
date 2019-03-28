import { OperationMap } from '../../../types/operations';
import { SET_OPERATION } from '../reducers';

export const setOperation = (operation: OperationMap) => ({ type: SET_OPERATION, operation });
