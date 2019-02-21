import * as localForage from 'localforage';
import { localForageKeys } from './localForage';

export const verifyAuthentication = () => new Promise<string>((resolve, reject) => {
  localForage.getItem<string>(localForageKeys.API_KEY)
    .then(value => {
      if (value) {
        resolve(value);
      } else {
        reject();
      }
    });
});
