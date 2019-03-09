import { Action } from 'redux';
import { FETCH_SOURCES, SET_ACTIVE_SOURCE_INDEX, SourcesAction } from '../reducers/sources';

export const fetchSources = (): Action => ({ type: FETCH_SOURCES });
export const setActiveSourceIndex = (activeSourceIndex: number): SourcesAction =>
  ({ type: SET_ACTIVE_SOURCE_INDEX, activeSourceIndex });
