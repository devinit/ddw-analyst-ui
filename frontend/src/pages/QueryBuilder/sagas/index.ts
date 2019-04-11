import { List } from 'immutable';
import { Action } from 'redux';
import { put, takeLatest } from 'redux-saga/effects';
import 'regenerator-runtime/runtime';
import { SET_ACTIVE_OPERATION } from '../../../reducers/operations';
import { OperationMap, OperationStepMap } from '../../../types/operations';
import { SET_OPERATION_STEPS } from '../reducers';

function* setOperationData({ activeOperation }: { activeOperation?: OperationMap } & Action) {
  if (!activeOperation) {
    yield put({ type: SET_OPERATION_STEPS, steps: List() });

    return;
  }
  const steps = activeOperation.get('operation_steps') as List<OperationStepMap> | undefined;
  if (!steps) {
    return;
  }
  yield put({ type: SET_OPERATION_STEPS, steps });
}

export function* queryBuilderSagas() {
  yield takeLatest(SET_ACTIVE_OPERATION, setOperationData);
}
