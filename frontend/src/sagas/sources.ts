import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { FETCH_SOURCES, FETCH_SOURCES_FAILED, FETCH_SOURCES_SUCCESSFUL, Source } from '../reducers/sources';
import { api, localForageKeys } from '../utils';
import * as localForage from 'localforage';
import { SET_ACTIVE_SOURCE } from '../pages/DataSources/reducers';

function* fetchSources() {
  try {
    const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
    const { status, data }: AxiosResponse<Source[]> = yield axios.request({
      url: api.routes.SOURCES,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then((response: AxiosResponse<Source[]>) => response);

    if (status === 200 && data) {
      yield put({ type: FETCH_SOURCES_SUCCESSFUL, sources: data });
      if (data.length) {
        yield put({ type: SET_ACTIVE_SOURCE, activeSource: fromJS(data[0]) });
      }
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
