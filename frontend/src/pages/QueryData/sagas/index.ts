import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { setToken } from '../../../actions/token';
import { Operation } from '../../../types/operations';
import { api, localForageKeys } from '../../../utils';
import { fetchOperationDataFailed, setOperationData } from '../actions';
import { FETCH_OPERATION_DATA, QueryDataAction } from '../reducers';

function* fetchOperationData({ payload }: QueryDataAction) {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<Operation> = yield axios
      .request({
        url: `${api.routes.SINGLE_DATASET}data/${payload.id}/?limit=${payload.limit}&offset=${payload.offset}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      })
      .then((response: AxiosResponse<Operation>) => response)
      .catch((error) => error.response);

    if (status === 200 || (status === 201 && data)) {
      yield put(setOperationData(fromJS(data), payload));
    } else if (status === 401) {
      yield put(setToken(''));
      yield put(fetchOperationDataFailed('') as QueryDataAction);
    } else {
      yield put(
        fetchOperationDataFailed(
          'An error occurred while executing query. Please contact your system administrator',
        ) as QueryDataAction,
      );
    }
  } catch (error) {
    yield put(
      fetchOperationDataFailed(
        'An error occurred while executing query. Please contact your system administrator',
      ) as QueryDataAction,
    );
  }
}

export function* queryDataSagas() {
  yield takeLatest(FETCH_OPERATION_DATA, fetchOperationData);
}
