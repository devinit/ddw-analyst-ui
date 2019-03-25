import {
  FETCH_SOURCES,
  FETCH_SOURCES_FAILED,
  FETCH_SOURCES_SUCCESSFUL,
  defaultState,
  sourcesReducer
} from '../sources';
import { Action } from 'redux';
import { fromJS } from 'immutable';
import { Source } from '../../types/sources';

test('should return the initial state', () => {
  expect(sourcesReducer(undefined, {} as Action)).toEqual(defaultState);
});

test('should handle FETCH_SOURCES', () => {
  expect(sourcesReducer(undefined, { type: FETCH_SOURCES }))
    .toEqual(defaultState.set('loading', true));
});

test('should handle FETCH_SOURCES_SUCCESSFUL', () => {
  const source = {
    pk: 1,
    indicator: 'Common Reporting Standard',
    indicator_acronym: 'crs',
    source_acronym: 'oecd',
    last_updated_on: new Date('August 19, 2018 23:15:30').toISOString(),
    source: 'OECD',
    source_url: 'https://stats.oecd.org',
    download_path: 'https://stats.oecd.org',
    description: 'Common RS data'
  } as Source;

  expect(sourcesReducer(undefined, {
    type: FETCH_SOURCES_SUCCESSFUL,
    sources: [ source ]
  }))
  .toEqual(defaultState.set('loading', false).set('sources', fromJS([ source ])));
});

test('should handle FETCH_SOURCES_FAILED', () => {
  expect(sourcesReducer(defaultState, { type: FETCH_SOURCES_FAILED }))
    .toEqual(defaultState.set('loading', false));
});
