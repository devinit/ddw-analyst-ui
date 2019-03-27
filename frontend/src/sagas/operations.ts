import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { onFetchOperationsFailed, onFetchOperationsSuccessful } from '../pages/DataSources/actions';
import { updateOperationInfo } from '../pages/Home/actions';
import { FETCH_OPERATIONS, OperationsAction } from '../reducers/operations';
import { APIResponse } from '../types/api';
import { Operation } from '../types/operations';
import { api, localForageKeys } from '../utils';

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
    .then((response: AxiosResponse<Operation[]>) => response);

    if (status === 200 && data.results) {
      yield put(onFetchOperationsSuccessful(data.results, data.count));
      yield put(updateOperationInfo({ next: data.next, previous: data.previous }, payload.offset));
    } else {
      yield put(onFetchOperationsFailed()); // TODO: add a reason for failure
    }
  } catch (error) {
    yield put(onFetchOperationsFailed()); // TODO: add a reason for failure
  }
}

export function* operationsSaga() {
  yield takeLatest(FETCH_OPERATIONS, fetchOperations);
}
