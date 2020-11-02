import * as localForage from 'localforage';
import { Source } from '../types/sources';

export const localForageKeys = {
  API_KEY: 'API_KEY',
  USER: 'USER',
  ACTIVE_SOURCE: 'ACTIVE_SOURCE',
  ACTIVE_OPERATION: 'ACTIVE_OPERATION',
};

export type LocalForageActiveSource = [number, Source];

export const clearStorage = (): Promise<void> => localForage.clear();
