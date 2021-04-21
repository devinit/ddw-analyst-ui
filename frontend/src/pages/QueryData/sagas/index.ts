import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { select, put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { setToken } from '../../../actions/token';
import { ReduxStore } from '../../../store';
import { Operation } from '../../../types/operations';
import { api, localForageKeys } from '../../../utils';
import { fetchOperationDataFailed, setOperationData } from '../actions';
import { FETCH_OPERATION_DATA, QueryDataAction } from '../reducers';
import { isCacheExpired } from '../utils';

function* fetchOperationData({ payload }: QueryDataAction) {
  try {
    const token: string = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const cacheData: string = yield localForage.getItem<string>(
      `${localForageKeys.DATASET_DATA}-${payload.limit}-${payload.offset}-${payload.id}`,
    );
    const cachedOperationUpdatedTime: string | null = yield localForage.getItem<string>(
      `${localForageKeys.DATASET_UPDATED_ON}-${payload.id}`,
    );
    const expiredCache: boolean = yield isCacheExpired(payload.id as number);

    const reduxState: ReduxStore = yield select();
    const activeOperationUpdatedTime = reduxState.getIn([
      'operations',
      'activeOperation',
      'updated_on',
    ]);

    if (cacheData && !expiredCache) {
      yield put(setOperationData(fromJS(JSON.parse(cacheData)), payload) as QueryDataAction);
    } else {
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
        localForage.setItem(
          `${localForageKeys.DATASET_DATA}-${payload.limit}-${payload.offset}-${payload.id}`,
          JSON.stringify(data),
        );
        if (cachedOperationUpdatedTime === null) {
          localForage.setItem(
            `${localForageKeys.DATASET_UPDATED_ON}-${payload.id}`,
            activeOperationUpdatedTime,
          );
        }
        yield put(setOperationData(fromJS(data), payload) as QueryDataAction);
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
