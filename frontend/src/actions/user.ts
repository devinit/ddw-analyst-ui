import { SET_USER, User, UserAction } from '../reducers/user';

export const setUser = (user: User): UserAction => ({ type: SET_USER, ...user });
