import * as localForage from 'localforage';
import moment from 'moment';
import { localForageKeys } from '..';
import { Source } from '../../types/sources';

export const fetchCachedSources = async (): Promise<Source[] | null | undefined> => {
  const updatedAt = await localForage.getItem<string>(localForageKeys.SOURCES_UPDATED_ON);
  if (updatedAt) {
    // is cache older than an hour?
    const cacheMoment = moment(updatedAt);
    const now = moment(new Date());
    if (now.diff(cacheMoment, 'hours') >= 1) {
      return [];
    }
  } else {
    return [];
  }

  return await localForage.getItem<Source[] | undefined>(localForageKeys.SOURCES);
};

export const updateSourcesCache = (sources: Source[]): void => {
  localForage.setItem(localForageKeys.SOURCES, sources);
  localForage.setItem(localForageKeys.SOURCES_UPDATED_ON, new Date().toISOString());
};

export const clearSourcesCache = (): void => {
  localForage.setItem(localForageKeys.SOURCES, undefined);
};
