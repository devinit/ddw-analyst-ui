import { all } from 'redux-saga/effects';
import { operationsSaga } from './operations';
import { sourcesSaga } from './sources';

export default function* rootSaga() {
  yield all([
    sourcesSaga(),
    operationsSaga()
  ]);
}
