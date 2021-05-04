import axios, { AxiosResponse } from 'axios';
import { fromJS, List } from 'immutable';
import * as localForage from 'localforage';
import { useEffect, useState } from 'react';
import { APIResponse } from '../../types/api';
import { OperationMap } from '../../types/operations';
import { Source, SourceMap } from '../../types/sources';
import { api, getSourceIDFromOperation, localForageKeys } from '../../utils';
import { fetchCachedSources, updateSourcesCache } from '../../utils/cache';
interface Options {
  limit: number;
  offset: number;
  link?: string;
  search?: string;
  id?: number | string;
}

const defaultOptions: Options = {
  limit: 10,
  offset: 0,
  link: '',
  search: '',
};

export const useSources = (options: Options = defaultOptions, fetch = false): List<SourceMap> => {
  const [token, setToken] = useState('');
  const [sources, setSources] = useState<List<SourceMap>>(fromJS([]));
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((_token) => {
      if (_token) setToken(_token);
    });
  }, []);

  const fetchSources = (): void => {
    const url = `${api.routes.SOURCES}?limit=${options.limit}&offset=${options.offset}&search=${
      options.search || ''
    }`;
    axios
      .request({
        url: options.link || url,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      })
      .then(({ status, data, statusText }: AxiosResponse<APIResponse<Source[]>>) => {
        if (status === 200 && data.results) {
          setSources(fromJS(data.results));
          updateSourcesCache(data.results);
        } else if (status === 401) {
          console.log('Failed to fetch sources: ', statusText);
          setSources(fromJS([]));
        }
      })
      .catch((error) => {
        console.log(
          `Failed to fetch sources: ${error.response.status} ${error.response.statusText}: ${error.response.data.detail}`,
        );
        setSources(fromJS([]));
      });
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    if (fetch) {
      fetchSources();
    } else {
      fetchCachedSources().then((sources) => {
        if (sources && sources.length) {
          setSources(fromJS(sources));
        } else {
          fetchSources();
        }
      });
    }
  }, [token, options.limit, options.offset, options.search]);

  return sources;
};

interface UseSourceResult {
  source?: SourceMap;
  loading: boolean;
}

export const useSource = (id?: number, fetch = false): UseSourceResult => {
  const [source, setSource] = useState<SourceMap | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchSource = () => {
    setLoading(true);
    axios
      .request({
        url: `${api.routes.SOURCES}${id}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(({ status, data, statusText }: AxiosResponse<Source>) => {
        if (status === 200 && data) {
          const activeSource = fromJS(data);
          setSource(activeSource);
          setLoading(false);
        } else if (status === 401) {
          console.log('Failed to fetch source: ', statusText);
          setSource(undefined);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(
          `Failed to fetch source: ${error.response.status} ${error.response.statusText}`,
        );
        setSource(undefined);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!id) return;
    if (fetch) {
      fetchSource();
    } else {
      localForage
        .getItem<Source | undefined>(localForageKeys.ACTIVE_SOURCE)
        .then((activeSource) => {
          if (activeSource && activeSource.id === id) {
            setSource(fromJS(activeSource));
            setLoading(false);
          } else {
            fetchSource();
          }
        });
    }
  }, [id]);

  return { loading, source };
};

export const useSourceFromOperation = (operation?: OperationMap): UseSourceResult => {
  const sourceID = operation && getSourceIDFromOperation(operation);

  return useSource(sourceID ? parseInt(sourceID) : undefined);
};
