import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { Source, SourceMap } from '../types/sources';

export interface SourcesAction extends Action {
  sources?: Source[];
  activeSource?: SourceMap;
  activeSourceIndex?: number;
  payload?: { id: string | number };
  loading?: boolean;
}

interface State {
  loading: boolean;
  sources: List<SourceMap>;
  activeSource?: SourceMap;
}
export type SourcesState = Map<keyof State, State[keyof State]>;

const prefix = 'sources';
export const FETCH_SOURCES = `${prefix}.FETCH`;
export const FETCH_SOURCES_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_SOURCES_FAILED = `${prefix}.FETCH_FAILED`;
export const SET_SOURCE = `${prefix}.SET_SOURCE`;
export const FETCH_SOURCE = `${prefix}.FETCH_SOURCE`;

export const defaultState: SourcesState = fromJS({ loading: false, sources: [], activeSourceId: 1 });

export const sourcesReducer: Reducer<SourcesState, SourcesAction> = (state = defaultState, action) => {
  if (action.type === FETCH_SOURCES || action.type === FETCH_SOURCE) {
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
  if (action.type === SET_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource).set('loading', !!action.loading);
  }

  return state;
};
