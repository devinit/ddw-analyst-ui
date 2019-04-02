import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { SET_ACTIVE_SOURCE } from '../pages/DataSources/reducers';
import { FETCH_SOURCES, FETCH_SOURCES_FAILED, FETCH_SOURCES_SUCCESSFUL } from '../reducers/sources';
import { APIResponse } from '../types/api';
import { Source } from '../types/sources';
import { api, localForageKeys } from '../utils';
import { setToken } from '../actions/token';

function* fetchSources() {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<APIResponse<Source[]>> = yield axios.request({
      url: api.routes.SOURCES,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Source[]>) => response)
    .catch(error => error.response);

    if (status === 200 && data.results) {
      yield put({ type: FETCH_SOURCES_SUCCESSFUL, sources: data.results });
      if (data.results.length) {
        yield put({ type: SET_ACTIVE_SOURCE, activeSource: fromJS(data.results[0]) });
      }
    } else if (status === 401) {
      yield put(setToken(''));
      yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
    } else {
      yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
    }
  } catch (error) {
    yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
  }
}

export function* sourcesSaga() {
  yield takeLatest(FETCH_SOURCES, fetchSources);
}
