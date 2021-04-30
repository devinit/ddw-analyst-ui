import { all } from 'redux-saga/effects';
import { operationsSaga } from './operations';
import { sourcesSaga } from './sources';
import { queryBuilderSagas } from '../pages/QueryBuilder/sagas';

export default function* rootSaga() {
  yield all([sourcesSaga(), operationsSaga(), queryBuilderSagas()]);
}
