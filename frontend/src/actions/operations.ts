import { FETCH_OPERATIONS, OperationsAction } from '../reducers/operations';

interface FetchOptions {
  limit?: number;
  offset?: number;
  link?: string;
}
export const fetchOperations = ({ limit = 10, offset = 0, link }: FetchOptions): Partial<OperationsAction> =>
  ({ type: FETCH_OPERATIONS, payload: { limit, offset, link } });
