import { sourcesSaga } from './sources';
import { all } from 'redux-saga/effects';

export default function* rootSaga() {
  yield all([
    sourcesSaga()
  ]);
}
