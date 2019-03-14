import { SET_TOKEN, TokenAction } from '../reducers/token';

export const setToken = (token: string): TokenAction => ({ type: SET_TOKEN, token });
