import { OperationsState, operationsReducer } from '../reducers/operations';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { dataSourcesReducer, dataSourcesReducerId } from '../pages/DataSources/reducers';
import { homeReducer, homeReducerId } from '../pages/Home/reducers';
import { queryBuilderReducer, queryBuilderReducerId } from '../pages/QueryBuilder/reducers';
import { queryDataReducer, queryDataReducerId } from '../pages/QueryData/reducers';
import { combineReducers } from 'redux-immutable';
import { SourcesState, sourcesReducer } from '../reducers/sources';
import { TokenState, tokenReducer } from '../reducers/token';
import { UserState, userReducer } from '../reducers/user';
import rootSaga from '../sagas';

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware();

const structuredReducers = {
  user: userReducer,
  token: tokenReducer,
  sources: sourcesReducer,
  operations: operationsReducer,
  [`${dataSourcesReducerId}`]: dataSourcesReducer,
  [`${queryBuilderReducerId}`]: queryBuilderReducer,
  [`${homeReducerId}`]: homeReducer,
  [`${queryDataReducerId}`]: queryDataReducer
};
const reducers = combineReducers(structuredReducers);

export const store = createStore(
  reducers,
  applyMiddleware(sagaMiddleware, loggerMiddleware)
);

sagaMiddleware.run(rootSaga);

export interface StoreState {
  user: UserState;
  token: TokenState;
  sources: SourcesState;
  operations: OperationsState;
  [key: string]: any;
}

export type ReduxStore = Map<keyof StoreState, StoreState[keyof StoreState]>;
