import { Action } from 'redux';
import { FETCH_OPERATIONS } from '../reducers/operations';

export const fetchOperations = (): Action => ({ type: FETCH_OPERATIONS });
