import { Action, Reducer } from 'redux';
import { Map, fromJS } from 'immutable';

export type UserAction = Action & User;

export interface User {
  id: number;
  username: string;
  is_superuser: boolean;
}
export type UserState = Map<keyof User, User[keyof User]>;

const prefix = 'user';
export const SET_USER = `${prefix}.SET`;

const defaultState: UserState = fromJS({}) as UserState;

export const userReducer: Reducer<UserState, UserAction> = (state = defaultState, action) => {
  if (action.type === SET_USER) {
    return state.withMutations((map) =>
      map
        .set('id', action.id)
        .set('username', action.username)
        .set('is_superuser', action.is_superuser),
    );
  }

  return state;
};
