import { List, Set } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';
import { OperationDataMap, OperationMap, OperationStepMap } from '../types/operations';
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

export const getSelectOptionsFromColumns = (columns?: ColumnList): DropdownItemProps[] => {
  if (columns && columns.count()) {
    return columns.map(column => ({
      key: column.get('id'),
      text: formatString(column.get('name') as string),
      value: column.get('name')
    })).toJS();
  }

  return [];
};

export const getStepSelectableColumns = (activeStep: OperationStepMap, steps: List<OperationStepMap>, columnsList: ColumnList) => { //tslint:disable-line
  const stepId = parseInt(activeStep.get('step_id') as string, 10);
  const previousSteps = steps.filter(step => parseInt(step.get('step_id') as string, 10) < stepId);
  if (previousSteps && previousSteps.count()) {
    return previousSteps.reduce((columns: Set<string>, step) => {
      const options = step.get('query_kwargs') as string | undefined;
      if (options) {
        const queryFunction = step.get('query_func');
        if (queryFunction === 'select') {
          const { columns: selectColumns } = JSON.parse(options) as { columns: string[] };

          return Set(selectColumns);
        }
        if (queryFunction === 'aggregate') {
          const { group_by, agg_func_name, operational_column } = JSON.parse(options);
          const aggregateColumns: string[] = group_by || [];
          aggregateColumns.push(`${operational_column}_${agg_func_name}`);

          return Set(aggregateColumns);
        }
        if (queryFunction === 'scalar_transform') {
          const { trans_func_name, operational_column } = JSON.parse(options);

          return columns.union([ `${operational_column}_${trans_func_name}` ]);
        }
      }

      return columns;
    }, Set(columnsList.map(column => column.get('name'))));
  }

  return Set(columnsList.map(column => column.get('name')));
};
