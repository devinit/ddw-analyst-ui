import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';

export type SourcesAction = Action & { sources?: Source[], activeSourceIndex?: number };

export interface Source {
  pk: number;
  indicator: string;
  indicator_acronym: string | null;
  source: string | null;
  source_acronym: string | null;
  source_url: string | null;
  download_path: string | null;
  last_updated_on: string;
  storage_type: string | null;
  active_mirror_name: string | null;
  description: string | null;
  created_on: string;
  updated_on: string | null;
  columns: ColumnList;
  update_history: UpdateHistoryList;
}
export interface Column {
  pk: number;
  name: string | null;
  description: string | null;
  source_name: string | null;
}
export interface UpdateHistory {
  source: number;
  history_table: string | null;
  is_major_release: boolean;
  released_on: string | null;
  release_description: string | null;
  invalidated_on: string | null;
  invalidation_description: string | null;
}
interface State {
  loading: boolean;
  sources: List<SourceMap>;
}
export type SourceMap = Map<keyof Source, Source[keyof Source]>;
export type ColumnList = List<ColumnMap>;
export type ColumnMap = Map<keyof Column, Column[keyof Column]>;
export type SourcesState = Map<keyof State, State[keyof State]>;
export type UpdateHistoryMap = Map<keyof UpdateHistory, UpdateHistory[keyof UpdateHistory]>;
export type UpdateHistoryList = List<UpdateHistoryMap>;

const prefix = 'sources';
export const FETCH_SOURCES = `${prefix}.FETCH`;
export const FETCH_SOURCES_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_SOURCES_FAILED = `${prefix}.FETCH_FAILED`;

const defaultState: SourcesState = fromJS({ loading: false, sources: [], activeSourceId: 1 });

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
