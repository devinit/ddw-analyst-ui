import { FETCH_SOURCES } from '../../reducers/sources';
import { fetchSources } from '../sources';

test('should create an action to fetch sources', () => {
  const expectedAction = { type: FETCH_SOURCES };

  expect(fetchSources()).toEqual(expectedAction);
});
