import { fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { SourceMap } from '../../../reducers/sources';

export type QueryBuilderAction = Action & { activeSource?: SourceMap };
interface State {
  activeSource?: SourceMap;
}
export type QueryBuilderState = Map<keyof State, State[keyof State]>;

export const queryBuilderReducerId = 'pages/QueryBuilder';
export const SET_ACTIVE_SOURCE = `${queryBuilderReducerId}.SET_ACTIVE_SOURCE`;

const defaultState: QueryBuilderState = fromJS({ activeSource: undefined });

export const queryBuilderReducer: Reducer<QueryBuilderState, QueryBuilderAction> = (state = defaultState, action) => {
  if (action.type === SET_ACTIVE_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource);
  }

  return state;
};
