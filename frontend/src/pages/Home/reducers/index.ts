import { Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { Links } from '../../../types/api';

export interface HomeAction extends Action {
  operations?: {
    links?: Links;
    limit?: number;
    offset?: number;
  };
}
interface State {
  operations: {
    links: Links;
    limit: number;
    offset: number;
  };
}
export type HomeState = Map<keyof State, State[keyof State]>;

const DEFAULT_LIMIT = 10;
export const homeReducerId = 'pages/Home';
export const UPDATE_OPERATIONS_INFO = `${homeReducerId}.UPDATE_OPERATIONS_INFO`;

const defaultState: HomeState = fromJS({
  operations: { links: {}, limit: DEFAULT_LIMIT, offset: 0 },
}) as HomeState;

export const homeReducer: Reducer<HomeState, HomeAction> = (state = defaultState, action) => {
  if (action.type === UPDATE_OPERATIONS_INFO && action.operations) {
    let { links, limit, offset } = action.operations;
    links = links || (state.getIn(['operations', 'links']) as Links);
    limit = typeof limit === 'number' ? limit : (state.getIn(['operations', 'limit']) as number);
    offset =
      typeof offset === 'number' ? offset : (state.getIn(['operations', 'offset']) as number);

    return state
      .setIn(['operations', 'links'], links)
      .setIn(['operations', 'limit'], limit)
      .setIn(['operations', 'offset'], offset);
  }

  return state;
};
