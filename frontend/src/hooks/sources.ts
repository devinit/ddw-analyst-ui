import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import { useEffect, useState } from 'react';
import { Source } from '../types/sources';
import { api, localForageKeys } from '../utils';
import { APIResponse } from '../types/api';

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

export const useSources = (options: Options = defaultOptions): Source[] => {
  const [token, setToken] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((_token) => setToken(_token));
  }, []);
  useEffect(() => {
    const url = `${api.routes.SOURCES}?limit=${options.limit}&offset=${options.offset}&search=${options.search}`;
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
          setSources(data.results);
        } else if (status === 401) {
          console.log('Failed to fetch sources: ', statusText);
          setSources([]);
        }
      })
      .catch((error) => {
        console.log(error.response);
        setSources([]);
      });
  }, [token, options]);

  return sources;
};
