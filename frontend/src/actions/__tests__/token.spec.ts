import { SET_TOKEN } from '../../reducers/token';
import { setToken } from '../token';

test('should create an action to set the token', () => {
  const token = 'abc123456';
  const expectedAction = { type: SET_TOKEN, token };

  expect(setToken(token)).toEqual(expectedAction);
});
