import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { FETCH_OPERATIONS, FETCH_OPERATIONS_FAILED, FETCH_OPERATIONS_SUCCESSFUL } from '../reducers/operations';
import { APIResponse } from '../types/api';
import { Operation } from '../types/operations';
import { api, localForageKeys } from '../utils';

function* fetchOperations() {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<APIResponse<Operation[]>> = yield axios.request({
      url: api.routes.OPERATIONS,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Operation[]>) => response);

    if (status === 200 && data.results) {
      yield put({ type: FETCH_OPERATIONS_SUCCESSFUL, operations: data.results });
    } else {
      yield put({ type: FETCH_OPERATIONS_FAILED }); // TODO: add a reason for failure
    }
  } catch (error) {
    yield put({ type: FETCH_OPERATIONS_FAILED }); // TODO: add a reason for failure
  }
}

export function* operationsSaga() {
  yield takeLatest(FETCH_OPERATIONS, fetchOperations);
}
