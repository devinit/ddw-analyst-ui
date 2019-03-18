import { QueryAction, QueryBuilderAction, SET_ACTION, SET_ACTIVE_SOURCE } from '../reducers';
import { SourceMap } from '../../../reducers/sources';

export const setActiveSource = (activeSource: SourceMap): QueryBuilderAction =>
  ({ type: SET_ACTIVE_SOURCE, activeSource });

export const setAction = (action?: QueryAction): QueryBuilderAction => ({ type: SET_ACTION, action });
