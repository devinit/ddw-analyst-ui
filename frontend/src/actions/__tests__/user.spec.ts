import { SET_USER, User } from '../../reducers/user';
import { setUser } from '../user';

test('should create an action to set the user', () => {
  const user: User = {
    id: 2,
    username: 'admin',
    is_superuser: true,
  };
  const expectedAction = { type: SET_USER, ...user };

  expect(setUser(user)).toEqual(expectedAction);
});
