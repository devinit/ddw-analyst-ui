import { Map } from 'immutable';
import { SourceMap } from '../../../reducers/sources';
import { SET_ACTIVE_SOURCE } from '../reducers';
import { setActiveSource } from '../actions';

test('should create an action to set the active source', () => {
  const activeSource = Map({
    pk: 1,
    indicator: 'Common Reporting Standard',
    indicator_acronym: 'crs',
    source_acronym: 'oecd',
    last_updated_on: new Date('August 19, 2018 23:15:30').toISOString(),
    source: 'OECD',
    source_url: 'https://stats.oecd.org',
    download_path: 'https://stats.oecd.org',
    description: 'Common RS data'
  }) as SourceMap;
  const expectedAction = { type: SET_ACTIVE_SOURCE, activeSource };

  expect(setActiveSource(activeSource)).toEqual(expectedAction);
});
