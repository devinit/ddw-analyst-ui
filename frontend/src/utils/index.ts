import { OperationMap, OperationStepMap } from '../types/operations';
import { List } from 'immutable';

export * from './api';
export * from './localForage';

export const getSourceIDFromOperation = (operation: OperationMap): string | undefined => {
  if (!operation) {
    return;
  }
  const steps = operation.get('operation_steps') as List<OperationStepMap> | undefined;
  if (!steps) {
    return;
  }

  return steps.getIn([ 0, 'source' ]);
};

export const formatString = (name: string) =>
  name.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.substr(1)}`).join(' ');
