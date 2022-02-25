import { fromJS, Map } from 'immutable';
import { SourceMap } from '../../../types/sources';
import { dataSourcesReducer, DataSourcesState, SET_ACTIVE_SOURCE } from '../reducers';

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
const defaultState = fromJS({ activeSource: undefined }) as unknown as DataSourcesState;

test('should return the initial state', () => {
  expect(dataSourcesReducer(undefined, {} as any)).toEqual(defaultState);
});

test('should handle SET_ACTIVE_SOURCE', () => {
  expect(dataSourcesReducer(defaultState, { type: SET_ACTIVE_SOURCE, activeSource })).toEqual(
    Map({ activeSource }),
  );
});
