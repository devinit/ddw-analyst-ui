import { fromJS } from 'immutable';
import { SET_USER, userReducer, UserState } from '../user';

test('should return the initial state', () => {
  expect(userReducer(undefined, {} as any)).toEqual(fromJS({}));
});

test('should handle SET_USER', () => {
  const user = { id: 1, username: 'admin', is_superuser: false };
  expect(userReducer(fromJS({}) as UserState, { type: SET_USER, ...user })).toEqual(fromJS(user));
});
