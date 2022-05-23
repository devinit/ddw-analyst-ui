import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { Source, SourceMap } from '../types/sources';

export interface SourcesAction extends Action {
  sources?: Source[];
  activeSource?: SourceMap;
  activeSourceIndex?: number;
  count: number;
  payload: Partial<{
    limit: number;
    offset: number;
    link: string;
    search: string;
    id: number | string;
    frozen: number;
  }>;
  loading?: boolean;
}

interface State {
  loading: boolean;
  sources: List<SourceMap>;
  activeSource?: SourceMap;
  count: number;
  limit: number;
  offset: number;
}
export type SourcesState = Map<keyof State, State[keyof State]>;

const prefix = 'sources';
export const FETCH_SOURCES = `${prefix}.FETCH`;
export const FETCH_SOURCES_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_SOURCES_FAILED = `${prefix}.FETCH_FAILED`;
export const SET_SOURCE = `${prefix}.SET_SOURCE`;
export const FETCH_SOURCE = `${prefix}.FETCH_SOURCE`;

export const defaultState: SourcesState = fromJS({
  loading: false,
  sources: [],
  activeSourceId: 1,
  limit: 10,
  offset: 0,
}) as SourcesState;

export const sourcesReducer: Reducer<SourcesState, SourcesAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === FETCH_SOURCES || action.type === FETCH_SOURCE) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_SOURCES_SUCCESSFUL && action.sources) {
    return state.withMutations((map) =>
      map
        .set('loading', false)
        .set('sources', fromJS(action.sources) as List<SourceMap>)
        .set('count', action.count)
        .set('limit', action.payload ? action.payload.limit : state.get('limit'))
        .set('offset', action.payload ? action.payload.offset : state.get('offset')),
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
