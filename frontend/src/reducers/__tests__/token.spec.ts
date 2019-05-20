import { SET_TOKEN, tokenReducer } from '../token';

test('should return the initial state', () => {
  expect(tokenReducer(undefined, {} as any)).toEqual('');
});

test('should handle SET_TOKEN', () => {
  const token = 'abc123456';
  expect(tokenReducer('', { type: SET_TOKEN, token }))
    .toEqual(token);
});
