import { all } from 'redux-saga/effects';
import { operationsSaga } from './operations';
import { sourcesSaga } from './sources';
import { queryDataSagas } from '../pages/QueryData/sagas';
import { queryBuilderSagas } from '../pages/QueryBuilder/sagas';

export default function* rootSaga() {
  yield all([sourcesSaga(), operationsSaga(), queryDataSagas(), queryBuilderSagas()]);
}
