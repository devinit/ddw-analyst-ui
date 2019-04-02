import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { setToken } from '../../../actions/token';
import { Operation } from '../../../types/operations';
import { api, localForageKeys } from '../../../utils';
import { fetchOperationDataFailed, fetchOperationFailed, setOperation, setOperationData } from '../actions';
import { FETCH_OPERATION, FETCH_OPERATION_DATA, QueryDataAction } from '../reducers';

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
    .then((response: AxiosResponse<Operation>) => response);

    if (status === 200 || status === 201 && data) {
      yield put(setOperation(fromJS(data)));
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

export function* queryDataSagas() {
  yield takeLatest(FETCH_OPERATION, fetchOperation);
  yield takeLatest(FETCH_OPERATION_DATA, fetchOperationData);
}
