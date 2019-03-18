import { QueryBuilderAction, SET_ACTIVE_SOURCE } from '../reducers';
import { SourceMap } from '../../../reducers/sources';

export const setActiveSource = (activeSource: SourceMap): QueryBuilderAction =>
  ({ type: SET_ACTIVE_SOURCE, activeSource });
