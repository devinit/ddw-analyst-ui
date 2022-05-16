import { FETCH_SOURCES } from '../../reducers/sources';
import { fetchSources } from '../sources';

test('should create an action to fetch sources', () => {
  const expectedAction = {
    type: FETCH_SOURCES,
    payload: { limit: 10, offset: 0, link: '', search: '', frozen: 0 },
  };

  expect(fetchSources()).toEqual(expectedAction);
});
