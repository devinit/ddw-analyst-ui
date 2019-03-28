import { all } from 'redux-saga/effects';
import { operationsSaga } from './operations';
import { sourcesSaga } from './sources';
import { queryDataSagas } from '../pages/QueryData/sagas';

export default function* rootSaga() {
  yield all([
    sourcesSaga(),
    operationsSaga(),
    queryDataSagas()
  ]);
}
