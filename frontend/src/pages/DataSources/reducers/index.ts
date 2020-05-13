import { fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { SourceMap } from '../../../types/sources';

export type DataSourcesAction = Action & { activeSource?: SourceMap };
interface State {
  activeSource?: SourceMap;
}
export type DataSourcesState = Map<keyof State, State[keyof State]>;

export const dataSourcesReducerId = 'pages/DataSources';
export const SET_ACTIVE_SOURCE = `${dataSourcesReducerId}.SET_ACTIVE_SOURCE`;

const defaultState: DataSourcesState = fromJS({ activeSource: undefined });

export const dataSourcesReducer: Reducer<DataSourcesState, DataSourcesAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === SET_ACTIVE_SOURCE && action.activeSource) {
    return state.set('activeSource', action.activeSource);
  }

  return state;
};
