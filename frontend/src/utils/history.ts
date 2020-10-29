/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { api, localForageKeys } from '.';
import { FrozenData } from '../components/SourceHistoryListItem/utils';
import { SavedQueryData } from '../components/DatasetHistoryCard/utils/types';

const SOURCE_HISTORY_BASEPATH = api.routes.FETCH_SOURCE_HISTORY;
const OPERATION_HISTORY_BASEPATH = api.routes.FETCH_DATASET_HISTORY;

export interface QueryResult<T = FrozenData> {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<T>;
}

interface FetchOptions {
  limit?: number;
  offset?: number;
}

export const fetchDataSourceHistory = async (
  id: number,
  options: FetchOptions = { limit: 10, offset: 0 },
): Promise<AxiosResponse<QueryResult>> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(
    `${SOURCE_HISTORY_BASEPATH}${id}?limit=${options.limit || 10}&offset=${options.offset || 0}`,
    { headers },
  );
};

export const fetchFrozenData = async (id: number): Promise<AxiosResponse<FrozenData>> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${api.routes.FROZEN_DATA}${id}`, { headers });
};

export const createFrozenData = async (data: FrozenData): Promise<AxiosResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const response = await axios.request({
    url: api.routes.FROZEN_DATA,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });

  return response;
};

export const deleteFrozeData = async (id: number): Promise<AxiosResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const response = await axios.request({
    url: `${api.routes.FROZEN_DATA}${id}`,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
  });

  return response;
};

export const fetchOperationHistory = async (
  id: number,
  options: FetchOptions = { limit: 10, offset: 0 },
): Promise<AxiosResponse<QueryResult<SavedQueryData>>> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(
    `${OPERATION_HISTORY_BASEPATH}${id}?limit=${options.limit || 10}&offset=${options.offset || 0}`,
    { headers },
  );
};

export const fetchSavedQueryData = async (id: number): Promise<AxiosResponse<SavedQueryData>> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  return await axios(`${api.routes.SINGLE_SAVED_QUERYSET}${id}`, { headers });
};

export const createSavedQueryData = async (data: SavedQueryData): Promise<AxiosResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const response = await axios.request({
    url: api.routes.SAVED_QUERYSETS,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });

  return response;
};

export const deleteSavedQueryData = async (id: number): Promise<AxiosResponse> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);
  const response = await axios.request({
    url: `${api.routes.SINGLE_SAVED_QUERYSET}${id}`,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
  });

  return response;
};
