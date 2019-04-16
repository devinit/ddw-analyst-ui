import { OperationDataMap, OperationMap, OperationStepMap } from '../types/operations';
import { List } from 'immutable';
import { ColumnList } from '../types/sources';

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

export const formatString = (name = '') =>
  name.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.substr(1)}`).join(' ');

export const getCustomColumns = (item: OperationDataMap, columns: ColumnList): string[] => {
  const columnKeys = columns.map(column => column.get('name')).toJS() as string[];
  const keysToIgnore = [ 'id', 'row_no' ];
  const customKeys: string[] = [];
  const iterator = item.keys();
  let key = iterator.next();
  while (!key.done) {
    const { value } = key;
    if (columnKeys.indexOf(value as string) === -1 && keysToIgnore.indexOf(value as string) === -1) {
      customKeys.push(value as string);
    }
    key = iterator.next();
  }

  return customKeys;
};
