import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { Operation, OperationMap } from '../types/operations';

export interface OperationsAction extends Action {
  operations?: Operation[];
  count: number;
  activeSourceIndex?: number;
  payload: Partial<{
    limit: number;
    offset: number;
    link: string;
  }>;
}
interface State {
  loading: boolean;
  operations: List<OperationMap>;
  count: number;
  activeOperationId: number;
}
export type OperationsState = Map<keyof State, State[keyof State]>;

const prefix = 'operations';
export const FETCH_OPERATIONS = `${prefix}.FETCH`;
export const FETCH_OPERATIONS_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_OPERATIONS_FAILED = `${prefix}.FETCH_FAILED`;

export const defaultState: OperationsState = fromJS({ loading: false, operations: [], activeOperationId: 1 });

export const operationsReducer: Reducer<OperationsState, OperationsAction> = (state = defaultState, action) => {
  if (action.type === FETCH_OPERATIONS) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_OPERATIONS_SUCCESSFUL && action.operations) {
    return state.withMutations(map =>
      map
        .set('loading', false)
        .set('operations', fromJS(action.operations))
        .set('count', action.count)
    );
  }
  if (action.type === FETCH_OPERATIONS_FAILED) {
    return state.set('loading', false);
  }

  return state;
};
