import { HomeAction, UPDATE_OPERATIONS_INFO } from '../reducers';
import { Links } from '../../../types/api';

export const updateOperationInfo = (links: Links, offset?: number): HomeAction =>
  ({ type: UPDATE_OPERATIONS_INFO, operations: { links, offset } });
