import * as localForage from 'localforage';

export const localForageKeys = {
  API_KEY: 'API_KEY',
  USER: 'USER',
  EVENT_ID: 'EVENT_ID',
};

export const clearStorage = () => localForage.clear();
