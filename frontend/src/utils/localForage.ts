import * as localForage from 'localforage';

export const localForageKeys = {
  API_KEY: 'API_KEY',
  USER: 'USER',
};

export const clearStorage = () => localForage.clear();
