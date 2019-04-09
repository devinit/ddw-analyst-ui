import { Action } from 'redux';
import { FETCH_SOURCE, FETCH_SOURCES, SET_SOURCE, SourcesAction } from '../reducers/sources';
import { SourceMap } from '../types/sources';

export const fetchSources = (): Action => ({ type: FETCH_SOURCES });
export const fetchActiveSource = (id: string | number) => ({ type: FETCH_SOURCE, payload: { id } });
export const setActiveSource = (activeSource: SourceMap, loading = false): Partial<SourcesAction> =>
  ({ type: SET_SOURCE, activeSource, loading });
