import * as localForage from 'localforage';
import { localForageKeys } from '..';
import { Source } from '../../types/sources';

export const fetchCachedSources = async (): Promise<Source[] | null | undefined> =>
  await localForage.getItem<Source[] | undefined>(localForageKeys.SOURCES);

export const updateSourcesCache = (sources: Source[]): void => {
  localForage.setItem(localForageKeys.SOURCES, sources);
};

export const clearSourcesCache = (): void => {
  localForage.setItem(localForageKeys.SOURCES, undefined);
};
