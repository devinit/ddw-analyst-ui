import * as localForage from 'localforage';

export const localForageKeys = {
  API_KEY: 'API_KEY'
};

export const clearStorage = () => localForage.clear();
