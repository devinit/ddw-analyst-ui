import { Action, Reducer } from 'redux';

export type TokenAction = Action & { token: string };
export type TokenState = Map<'token', string>;
const prefix = 'token';
export const SET_TOKEN = `${prefix}.SET`;

const defaultState = '';

export const tokenReducer: Reducer<string, TokenAction> = (state = defaultState, action) => {
  if (action.type === SET_TOKEN) {
    return action.token;
  }

  return state;
};
