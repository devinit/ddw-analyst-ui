import {
  FETCH_SOURCES,
  FETCH_SOURCES_FAILED,
  FETCH_SOURCES_SUCCESSFUL,
  SourcesAction,
  defaultState,
  sourcesReducer
} from '../sources';
import { fromJS } from 'immutable';
import { Source } from '../../types/sources';

test('should return the initial state', () => {
  expect(sourcesReducer(undefined, {} as SourcesAction)).toEqual(defaultState);
});

test('should handle FETCH_SOURCES', () => {
  expect(sourcesReducer(undefined, { type: FETCH_SOURCES } as SourcesAction))
    .toEqual(defaultState.set('loading', true));
});

test('should handle FETCH_SOURCES_SUCCESSFUL', () => {
  const source = {
    id: 1,
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
    sources: [ source ],
    count: 1
  } as SourcesAction))
  .toEqual(defaultState.set('loading', false).set('sources', fromJS([ source ])).set('count', 1));
});

test('should handle FETCH_SOURCES_FAILED', () => {
  expect(sourcesReducer(defaultState, { type: FETCH_SOURCES_FAILED } as SourcesAction))
    .toEqual(defaultState.set('loading', false));
});
