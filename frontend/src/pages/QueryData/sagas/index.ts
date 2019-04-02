import axios, { AxiosResponse } from 'axios';
import { List, fromJS } from 'immutable';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { setToken } from '../../../actions/token';
import { APIResponse } from '../../../types/api';
import { Operation, OperationStepMap } from '../../../types/operations';
import { Source } from '../../../types/sources';
import { api, localForageKeys } from '../../../utils';
import { fetchOperationDataFailed, fetchOperationFailed, setOperation, setOperationData } from '../actions';
import { FETCH_OPERATION, FETCH_OPERATION_DATA, FETCH_SOURCE, QueryDataAction, SET_SOURCE } from '../reducers';

function* fetchOperation({ payload }: QueryDataAction) {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<Operation> = yield axios.request({
      url: `${api.routes.OPERATIONS}${payload.id}/`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Operation>) => response)
    .catch(error => error.response);

    if (status === 200 || status === 201 && data) {
      const operation = fromJS(data);
      yield put(setOperation(operation, true));
      yield put(({ type: FETCH_SOURCE, operation }));
    } else if (status === 401) {
      yield put(setToken(''));
      yield put(fetchOperationFailed() as QueryDataAction);
    } else {
      yield put(fetchOperationFailed() as QueryDataAction);
    }
  } catch (error) {
    yield put(fetchOperationFailed() as QueryDataAction);
  }
}

function* fetchOperationData({ payload }: QueryDataAction) {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<Operation> = yield axios.request({
      url: `${api.routes.OPERATIONS}data/${payload.id}/`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Operation>) => response)
    .catch(error => error.response);

    if (status === 200 || status === 201 && data) {
      yield put(setOperationData(fromJS(data)));
    } else if (status === 401) {
      yield put(setToken(''));
      yield put(fetchOperationDataFailed() as QueryDataAction);
    } else {
      yield put(fetchOperationDataFailed() as QueryDataAction);
    }
  } catch (error) {
    yield put(fetchOperationDataFailed() as QueryDataAction);
  }
}

function* fetchSource({ operation }: QueryDataAction) {
  if (!operation) {
    return;
  }
  const steps = operation.get('operation_steps') as List<OperationStepMap> | undefined;
  if (!steps) {
    return;
  }
  const sourceId = steps.getIn([ 0, 'source' ]);
  if (!sourceId) {
    return;
  }
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<APIResponse<Source>> = yield axios.request({
      url: `${api.routes.SOURCES}${sourceId}/`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Source[]>) => response)
    .catch(error => error.response);

    if (status === 200 || status === 201) {
      yield put({ type: SET_SOURCE, source: fromJS(data) });
    } else if (status === 401) {
      yield put(setToken(''));
    } else {
      yield console.log('Failed to fetch source'); //tslint:disable-line
    }
  } catch (error) {
    yield console.log('Failed to fetch source'); //tslint:disable-line
  }
}

export function* queryDataSagas() {
  yield takeLatest(FETCH_OPERATION, fetchOperation);
  yield takeLatest(FETCH_OPERATION_DATA, fetchOperationData);
  yield takeLatest(FETCH_SOURCE, fetchSource);
}
