import { FETCH_SOURCE, FETCH_SOURCES, SET_SOURCE, SourcesAction } from '../reducers/sources';
import { FetchOptions } from '../types/api';
import { SourceMap } from '../types/sources';

// tslint:disable-next-line max-line-length
export const fetchSources = ({
  limit = 10,
  offset = 0,
  link = '',
  search = '',
}: FetchOptions = {}): Partial<SourcesAction> => ({
  type: FETCH_SOURCES,
  payload: { limit, offset, link, search },
});
export const fetchActiveSource = (id: string | number) => ({ type: FETCH_SOURCE, payload: { id } });
export const setActiveSource = (
  activeSource: SourceMap,
  loading = false,
): Partial<SourcesAction> => ({ type: SET_SOURCE, activeSource, loading });
