import axios, { AxiosResponse, AxiosError } from 'axios';
import * as localForage from 'localforage';
import { api } from './api';
import { localForageKeys } from './localForage';
// import { APIResponse } from '../types/api';
import { Source, SourceMap } from '../types/sources';

// import { SET_ACTIVE_SOURCE } from '../pages/DataSources/reducers';
// import { put, takeLatest } from 'redux-saga/effects';
// import 'regenerator-runtime/runtime';
// import { fromJS } from 'immutable';
// import {
//   FETCH_SOURCE,
//   FETCH_SOURCES,
//   FETCH_SOURCES_FAILED,
//   FETCH_SOURCES_SUCCESSFUL,
//   SourcesAction,
// } from '../reducers/sources';
// import { fromJS } from 'immutable';

// import { setToken } from '../actions/token';
// import { setActiveSource } from '../actions/sources';

interface FetchSourcesResponse {
  error?: AxiosError;
  sources?: Source[];
  count?: number;
}

interface FetchSources {
  sources?: Source[];
  activeSource?: SourceMap;
  activeSourceIndex?: number;
  count: number;
  payload: Partial<{
    limit: number;
    offset: number;
    link: string;
    search: string;
    id: number | string;
  }>;
  loading?: boolean;
}

export const fetchSources = async ({ payload }: FetchSources): Promise<FetchSourcesResponse> => {
  const url = `${api.routes.SOURCES}?limit=${payload.limit}&offset=${payload.offset}&search=${payload.search}`;
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  try {
    const response = await axios
      .request({
        url: payload.link || url,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      })
      .then((response: AxiosResponse<Source[]>) => response)
      .catch((error) => error.response);
    if (response.status === 200 && response.data) {
      return {
        sources: response.data.results,
        count: response.data.count,
      };
    }

    return { error: response };
  } catch (error) {
    return { error: error };
  }
};

//     if (status === 200 && data.results) {
//       yield put({
//         type: FETCH_SOURCES_SUCCESSFUL,
//         sources: data.results,
//         count: data.count,
//         payload,
//       });
//       if (data.results.length) {
//         yield put({ type: SET_ACTIVE_SOURCE, activeSource: fromJS(data.results[0]) });
//       }
//     } else if (status === 401) {
//       yield put(setToken(''));
//       yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
//     } else {
//       yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
//     }
//   } catch (error) {
//     yield put({ type: FETCH_SOURCES_FAILED }); // TODO: add a reason for failure
//   }

// function* fetchSource({ payload }: SourcesAction) {
//   const sourceId = payload && payload.id;
//   if (!sourceId) {
//     return;
//   }
//   try {
//     const token = yield localForage.getItem<string>(localForageKeys.API_KEY);
//     const { status, data }: AxiosResponse<APIResponse<Source>> = yield axios
//       .request({
//         url: `${api.routes.SOURCES}${sourceId}/`,
//         method: 'get',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `token ${token}`,
//         },
//       })
//       .then((response: AxiosResponse<Source[]>) => response)
//       .catch((error) => error.response);

//     if (status === 200 || status === 201) {
//       yield put(setActiveSource(fromJS(data)) as SourcesAction);
//     } else if (status === 401) {
//       yield put(setToken(''));
//     } else {
//       yield console.log('Failed to fetch source'); //tslint:disable-line
//     }
//   } catch (error) {
//     yield console.log('Failed to fetch source'); //tslint:disable-line
//   }
// }

// export function* sourcesSaga() {
//   yield takeLatest(FETCH_SOURCES, fetchSources);
//   yield takeLatest(FETCH_SOURCE, fetchSource);
