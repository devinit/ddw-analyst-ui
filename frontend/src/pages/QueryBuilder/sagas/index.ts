import axios, { AxiosResponse } from 'axios';
import { List, fromJS } from 'immutable';
import * as localForage from 'localforage';
import { Action } from 'redux';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { APIResponse } from '../../../types/api';
import { OperationMap, OperationStepMap } from '../../../types/operations';
import { Source } from '../../../types/sources';
import { api, localForageKeys } from '../../../utils';
import { SET_ACTIVE_SOURCE, SET_OPERATION_STEPS, UPDATE_OPERATION } from '../reducers';
import { setToken } from '../../../actions/token';

function* setOperationData({ operation }: { operation?: OperationMap } & Action) {
  if (!operation) {
    return;
  }
  const steps = operation.get('operation_steps') as List<OperationStepMap> | undefined;
  if (!steps) {
    return;
  }
  yield put({ type: SET_OPERATION_STEPS, steps });
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
      yield put({ type: SET_ACTIVE_SOURCE, activeSource: fromJS(data) });
    } else if (status === 401) {
      yield put(setToken(''));
    } else {
      yield console.log('Failed to fetch source'); //tslint:disable-line
    }
  } catch (error) {
    yield console.log('Something went wrong while fetching source'); //tslint:disable-line
  }
}

export function* queryBuilderSagas() {
  yield takeLatest(UPDATE_OPERATION, setOperationData);
}
