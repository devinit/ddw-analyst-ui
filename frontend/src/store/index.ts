import { Map } from 'immutable';
import { applyMiddleware, compose, createStore } from 'redux';
import { combineReducers } from 'redux-immutable';
// import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { dataSourcesReducer, dataSourcesReducerId } from '../pages/DataSources/reducers';
import { homeReducer, homeReducerId } from '../pages/Home/reducers';
import { queryBuilderReducer, queryBuilderReducerId } from '../pages/QueryBuilder/reducers';
import { ModalState, modalReducer } from '../reducers/modal';
import { OperationsState, operationsReducer } from '../reducers/operations';
import { SourcesState, sourcesReducer } from '../reducers/sources';
import { TokenState, tokenReducer } from '../reducers/token';
import { UserState, userReducer } from '../reducers/user';
import rootSaga from '../sagas';

// const loggerMiddleware = createLogger();
export const sagaMiddleware = createSagaMiddleware();

const structuredReducers = {
  user: userReducer,
  token: tokenReducer,
  modal: modalReducer,
  sources: sourcesReducer,
  operations: operationsReducer,
  [`${dataSourcesReducerId}`]: dataSourcesReducer,
  [`${queryBuilderReducerId}`]: queryBuilderReducer,
  [`${homeReducerId}`]: homeReducer,
};
const reducers = combineReducers(structuredReducers);
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(sagaMiddleware /* , loggerMiddleware */)),
);

sagaMiddleware.run(rootSaga);

export interface StoreState {
  user: UserState;
  token: TokenState;
  modal: ModalState;
  sources: SourcesState;
  operations: OperationsState;
  [key: string]: any;
}

export type ReduxStore = Map<keyof StoreState, StoreState[keyof StoreState]>;
