import { Action, Reducer } from 'redux';
import { Map, fromJS } from 'immutable';

export type UserAction = Action & User;

export interface User {
  id: number;
  username: string;
}
export type UserState = Map<keyof User, User[keyof User]>;

const prefix = 'user';
export const SET_USER = `${prefix}.SET`;

const defaultState: UserState = fromJS({});

export const userReducer: Reducer<UserState, UserAction> = (state = defaultState, action) => {
    if (action.type === SET_USER) {
        return state.withMutations(map =>
          map.set('id', action.id).set('username', action.username)
        );
    }

    return state;
};
