import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { api, localForageKeys } from '../../../utils';
import { Operation } from '../../../types/operations';
import { FETCH_OPERATION, QueryDataAction } from '../reducers';
import { fetchOperationFailed, setOperation } from '../actions';
import { fromJS } from 'immutable';

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

export function* queryDataSagas() {
  yield takeLatest(FETCH_OPERATION, fetchOperation);
}
