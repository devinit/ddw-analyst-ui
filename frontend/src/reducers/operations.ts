/* eslint-disable @typescript-eslint/naming-convention */
import { History } from 'history';
import { fromJS, List, Map } from 'immutable';
import localForage from 'localforage';
import { Action, Reducer } from 'redux';
import { Operation, OperationMap } from '../types/operations';
import { localForageKeys } from '../utils';

export interface OperationsAction extends Action {
  operations?: Operation[];
  activeOperation?: OperationMap;
  count: number;
  activeSourceIndex?: number;
  payload: Partial<{
    limit: number;
    offset: number;
    link: string;
    search: string;
    id: number | string;
    history: History;
    mine: boolean;
  }>;
  loading?: boolean;
}
interface State {
  loading: boolean;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  count: number;
  activeOperationId: number;
}
export type OperationsState = Map<keyof State, State[keyof State]>;

const prefix = 'operations';
export const FETCH_OPERATIONS = `${prefix}.FETCH`;
export const FETCH_OPERATIONS_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_OPERATIONS_FAILED = `${prefix}.FETCH_FAILED`;
export const SET_ACTIVE_OPERATION = `${prefix}.SET_ACTIVE_OPERATION`;
export const FETCH_OPERATION = `${prefix}.FETCH_OPERATION`;
export const FETCH_OPERATION_FAILED = `${prefix}.FETCH_FAILED`;
export const DELETE_OPERATION = `${prefix}.DELETE_OPERATION`;
export const DELETE_OPERATION_SUCCESSFUL = `${prefix}.DELETE_OPERATION_SUCCESSFUL`;
export const DELETE_OPERATION_FAILED = `${prefix}.DELETE_OPERATION_FAILED`;

export const defaultState: OperationsState = fromJS({
  loading: false,
  operations: [],
  activeOperationId: 1,
}) as OperationsState;

export const operationsReducer: Reducer<OperationsState, OperationsAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === FETCH_OPERATIONS || action.type === FETCH_OPERATION) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_OPERATIONS_SUCCESSFUL && action.operations) {
    return state.withMutations((map) =>
      map
        .set('loading', false)
        .set('operations', fromJS(action.operations) as List<OperationMap>)
        .set('count', action.count),
    );
  }
  if (action.type === FETCH_OPERATIONS_FAILED || action.type === FETCH_OPERATION_FAILED) {
    return state.set('loading', false);
  }
  if (action.type === SET_ACTIVE_OPERATION) {
    localForage.setItem(localForageKeys.ACTIVE_OPERATION, action.activeOperation);

    return state.set('activeOperation', action.activeOperation).set('loading', false);
  }

  return state;
};
