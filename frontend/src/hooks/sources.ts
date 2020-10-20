import axios, { AxiosResponse } from 'axios';
import { fromJS, List } from 'immutable';
import * as localForage from 'localforage';
import { useEffect, useState } from 'react';
import { APIResponse } from '../types/api';
import { Source, SourceMap } from '../types/sources';
import { api, localForageKeys } from '../utils';
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

export const useSources = (options: Options = defaultOptions): List<SourceMap> => {
  const [token, setToken] = useState('');
  const [sources, setSources] = useState<List<SourceMap>>(fromJS([]));
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((_token) => setToken(_token));
  }, []);
  useEffect(() => {
    if (!token) {
      return;
    }
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
  }, [token, options.limit, options.offset, options.search]);

  return sources;
};

export const useSource = (id: number, fetch = false): SourceMap => {
  const [source, setSource] = useState<SourceMap>(fromJS({}));

  const fetchSource = () =>
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
        } else if (status === 401) {
          console.log('Failed to fetch source: ', statusText);
          setSource(fromJS({}));
        }
      })
      .catch((error) => {
        console.log(
          `Failed to fetch source: ${error.response.status} ${error.response.statusText}`,
        );
        setSource(fromJS([]));
      });
  useEffect(() => {
    if (fetch) {
      fetchSource();
    } else {
      localForage
        .getItem<Source | undefined>(localForageKeys.ACTIVE_SOURCE)
        .then((activeSource) => {
          if (activeSource && activeSource.id === id) {
            setSource(fromJS(activeSource));
          } else {
            fetchSource();
          }
        });
    }
  }, [id]);

  return source;
};
