import { DataSourcesAction, SET_ACTIVE_SOURCE } from '../reducers';
import { SourceMap } from '../../../types/sources';

export const setActiveSource = (activeSource: SourceMap): DataSourcesAction =>
  ({ type: SET_ACTIVE_SOURCE, activeSource });
