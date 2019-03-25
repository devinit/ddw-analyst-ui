import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { Source, SourceMap } from '../types/sources';

export type SourcesAction = Action & { sources?: Source[], activeSourceIndex?: number };

interface State {
  loading: boolean;
  sources: List<SourceMap>;
}
export type SourcesState = Map<keyof State, State[keyof State]>;

const prefix = 'sources';
export const FETCH_SOURCES = `${prefix}.FETCH`;
export const FETCH_SOURCES_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_SOURCES_FAILED = `${prefix}.FETCH_FAILED`;

export const defaultState: SourcesState = fromJS({ loading: false, sources: [], activeSourceId: 1 });

export const sourcesReducer: Reducer<SourcesState, SourcesAction> = (state = defaultState, action) => {
  if (action.type === FETCH_SOURCES) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_SOURCES_SUCCESSFUL && action.sources) {
    return state.withMutations(map =>
      map.set('loading', false).set('sources', fromJS(action.sources))
    );
  }
  if (action.type === FETCH_SOURCES_FAILED) {
    return state.set('loading', false);
  }

  return state;
};
