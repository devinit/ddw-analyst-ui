import { Action } from 'redux';
import { FETCH_SOURCES } from '../reducers/sources';

export const fetchSources = (): Action => ({ type: FETCH_SOURCES });
