import { applyMiddleware, createStore } from 'redux';
import { combineReducers } from 'redux-immutable';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { TokenState, tokenReducer } from '../reducers/token';
import { UserState, userReducer } from '../reducers/user';

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware();

const structuredReducers = {
  user: userReducer,
  token: tokenReducer
};
const reducers = combineReducers(structuredReducers);

export const store = createStore(
  reducers,
  applyMiddleware(sagaMiddleware, loggerMiddleware)
);

export interface StoreState {
  user: UserState;
  token: TokenState;
}

export type ReduxStore = Map<keyof StoreState, StoreState[keyof StoreState]>;
