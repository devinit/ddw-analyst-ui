import * as localForage from 'localforage';
import { Source } from '../types/sources';

export const localForageKeys = {
  API_KEY: 'API_KEY',
  USER: 'USER',
  ACTIVE_SOURCE: 'ACTIVE_SOURCE',
  ACTIVE_OPERATION: 'ACTIVE_OPERATION',
  SOURCES: 'SOURCES',
  DATASET_DATA: 'DATASET_DATA',
  DATASET_DATA_UPDATED_ON: 'DATASET_DATA_UPDATED_ON',
  DATASET_UPDATED_ON: 'DATASET_UPDATED_ON',
  MY_DATASETS: 'MY_DATASETS',
  PUBLISHED_DATASETS: 'PUBLISHED_DATASETS',
  DATASET_COUNT: 'DATASET_COUNT',
};

export type LocalForageActiveSource = [number, Source];

export const clearStorage = (): Promise<void> => localForage.clear();
