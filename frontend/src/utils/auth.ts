import * as localForage from 'localforage';
import { localForageKeys } from './localForage';

export const getAPIToken = () => new Promise<string>((resolve, reject) => {
  localForage.getItem<string>(localForageKeys.API_KEY)
    .then(value => {
      if (value) {
        resolve(value);
      } else {
        reject();
      }
    });
});

export const setAPIToken = (token: string) => {
  localForage.setItem(localForageKeys.API_KEY, token);
};

export const clearStorage = () => localForage.clear();
