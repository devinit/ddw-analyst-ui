import { FETCH_OPERATION, FETCH_OPERATIONS, OperationsAction } from '../reducers/operations';
import { updateOperationInfo } from '../pages/Home/actions';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { setToken } from '../actions/token';
import { onFetchOperationsFailed, onFetchOperationsSuccessful } from '../pages/DataSources/actions';
import * as localForage from 'localforage';
import axios, { AxiosResponse } from 'axios';
import { APIResponse } from '../types/api';
import { Operation } from '../types/operations';
import { api, getSourceIDFromOperation, localForageKeys } from '../utils';
import { fromJS } from 'immutable';
import { fetchOperationFailed, setOperation } from '../actions/operations';
import { fetchActiveSource } from '../actions/sources';

function* fetchOperations({ payload }: OperationsAction) {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<APIResponse<Operation[]>> = yield axios.request({
      url: payload.link || `${api.routes.OPERATIONS}?limit=${payload.limit}&offset=${payload.offset}`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Operation[]>) => response)
    .catch(error => error.response);

    if (status === 200 && data.results) {
      yield put(onFetchOperationsSuccessful(data.results, data.count));
      yield put(updateOperationInfo({ next: data.next, previous: data.previous }, payload.offset));
    } else if (status === 401) {
      yield put(setToken(''));
      yield put(onFetchOperationsFailed()); // TODO: add a reason for failure
    } else {
      yield put(onFetchOperationsFailed()); // TODO: add a reason for failure
    }
  } catch (error) {
    yield put(onFetchOperationsFailed()); // TODO: add a reason for failure
  }
}

function* fetchOperation({ payload }: OperationsAction) {
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
      yield put(setOperation(operation, true) as OperationsAction);
      const sourceID = getSourceIDFromOperation(operation);
      if (sourceID) {
        yield put(fetchActiveSource(sourceID));
      }
    } else if (status === 401) {
      yield put(setToken(''));
      yield put(fetchOperationFailed() as OperationsAction);
    } else {
      yield put(fetchOperationFailed() as OperationsAction);
    }
  } catch (error) {
    yield put(fetchOperationFailed() as OperationsAction);
  }
}

export function* operationsSaga() {
  yield takeLatest(FETCH_OPERATIONS, fetchOperations);
  yield takeLatest(FETCH_OPERATION, fetchOperation);
}
