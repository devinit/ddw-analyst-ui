import { Map, fromJS } from 'immutable';
import { SET_ACTIVE_SOURCE, dataSourcesReducer } from '../reducers';
import { SourceMap } from '../../../types/sources';

const activeSource = Map({
  pk: 1,
  indicator: 'Common Reporting Standard',
  indicator_acronym: 'crs',
  source_acronym: 'oecd',
  last_updated_on: new Date('August 19, 2018 23:15:30').toISOString(),
  source: 'OECD',
  source_url: 'https://stats.oecd.org',
  download_path: 'https://stats.oecd.org',
  description: 'Common RS data',
}) as SourceMap;
const defaultState = fromJS({ activeSource: undefined });

test('should return the initial state', () => {
  expect(dataSourcesReducer(undefined, {} as any)).toEqual(defaultState);
});

test('should handle SET_ACTIVE_SOURCE', () => {
  expect(dataSourcesReducer(defaultState, { type: SET_ACTIVE_SOURCE, activeSource })).toEqual(
    Map({ activeSource }),
  );
});
