/* eslint-disable @typescript-eslint/naming-convention */
import { List, Set } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';
import {
  AdvancedQueryColumn,
  AdvancedQueryOptionsMap,
  AggregateOptions,
  OperationDataMap,
  OperationMap,
  OperationStepMap,
  TransformOptions,
  WindowOptions,
} from '../types/operations';
import { ColumnList, SourceMap } from '../types/sources';
import { api } from './api';

export * from './api';
export * from './localForage';
export * from './update';

export const getSourceIDFromOperation = (operation: OperationMap): number | undefined => {
  if (!operation) {
    return;
  }
  const steps = operation.get('operation_steps') as List<OperationStepMap> | undefined;
  if (steps && steps.size) {
    return steps.getIn([0, 'source']) as number;
  }

  if (operation.get('advanced_config')) {
    const config = operation.get('advanced_config') as AdvancedQueryOptionsMap;

    return config.get('source') as number;
  }
};

export const formatString = (name = ''): string =>
  name
    .split('_')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.substr(1)}`)
    .join(' ');

export const getCustomColumns = (item: OperationDataMap, columns: ColumnList): string[] => {
  const columnKeys = columns.map((column) => column.get('name')).toJS() as string[];
  const keysToIgnore = ['id', 'row_no'];
  const customKeys: string[] = [];
  const iterator = item.keys();
  let key = iterator.next();
  while (!key.done) {
    const { value } = key;
    if (
      columnKeys.indexOf(value as string) === -1 &&
      keysToIgnore.indexOf(value as string) === -1
    ) {
      customKeys.push(value as string);
    }
    key = iterator.next();
  }

  return customKeys;
};

export const getSelectOptionsFromColumns = (columns?: ColumnList): DropdownItemProps[] => {
  if (columns && columns.count()) {
    return columns
      .map((column) => ({
        key: column.get('id'),
        text: formatString(column.get('name') as string),
        value: column.get('name'),
      }))
      .toJS() as DropdownItemProps[];
  }

  return [];
};

export const sort = (valueA: number | string, valueB: number | string): number => {
  if (valueA < valueB) {
    return -1;
  }
  if (valueA > valueB) {
    return 1;
  }

  return 0;
};

export const sortSteps = (stepA: OperationStepMap, stepB: OperationStepMap): number => {
  const valueA = stepA.get('step_id') as number;
  const valueB = stepB.get('step_id') as number;

  return sort(valueA, valueB);
};

export const sortObjectArrayByProperty = (property: string) => {
  return {
    sort: (targetA: { [key: string]: any }, targetB: { [key: string]: any }) =>
      sort(targetA[property], targetB[property]),
  };
};

export const getStepSelectableColumns = (
  activeStep: OperationStepMap,
  steps: List<OperationStepMap>,
  columnsList: ColumnList,
): Set<string> => {
  //tslint:disable-line
  const stepId = parseInt(activeStep.get('step_id') as string, 10);
  const previousSteps = steps
    .filter((step) => parseInt(step.get('step_id') as string, 10) < stepId)
    .sort(sortSteps);
  if (previousSteps && previousSteps.count()) {
    return previousSteps.reduce<Set<string>>((columns: Set<string>, step): Set<string> => {
      const options = step.get('query_kwargs') as string | undefined;
      if (options) {
        const queryFunction = step.get('query_func');
        if (queryFunction === 'select') {
          const { columns: selectColumns } = JSON.parse(options) as { columns: string[] };

          return Set(selectColumns);
        }
        if (queryFunction === 'aggregate') {
          const { group_by, agg_func_name, operational_column }: AggregateOptions =
            JSON.parse(options);
          const aggregateColumns: string[] = group_by || [];
          aggregateColumns.push(`${operational_column}_${agg_func_name}`);

          return Set(aggregateColumns);
        }
        if (queryFunction === 'scalar_transform') {
          const { trans_func_name, operational_column }: TransformOptions = JSON.parse(options);

          return columns.union([`${operational_column}_${trans_func_name}`]);
        }
        if (queryFunction === 'multi_transform') {
          const { trans_func_name, operational_columns }: TransformOptions = JSON.parse(options);

          return operational_columns && operational_columns.length
            ? columns.union([`${operational_columns[0]}_${trans_func_name}`])
            : columns;
        }
        if (queryFunction === 'join') {
          const { columns_x, columns_y } = JSON.parse(options);

          return Set(columns_x || []).union(columns_y || []) as Set<string>;
        }
        if (queryFunction === 'window') {
          const { columns: windowColumns, window_fn }: WindowOptions = JSON.parse(options);

          return windowColumns && windowColumns.length
            ? Set(windowColumns).union([window_fn.toLowerCase()])
            : columns.union([window_fn.toLowerCase()]);
        }
      }

      return columns;
    }, Set(columnsList.map((column) => column.get('name') as string)));
  }

  return Set(columnsList.map((column) => column.get('name') as string));
};

export const getSelectOptionsFromSources = (
  sources: List<SourceMap>,
  exclude?: SourceMap,
): DropdownItemProps[] =>
  sources
    .filter((source) => (exclude ? source.get('id') !== exclude.get('id') : true))
    .map((source) => ({
      key: source.get('id'),
      text: source.get('indicator'),
      value: source.get('id'),
    }))
    .toJS()
    .sort(sortObjectArrayByProperty('text').sort) as DropdownItemProps[];

export const getColumnFromName = (
  name: string,
  columns: AdvancedQueryColumn[],
): AdvancedQueryColumn | undefined =>
  columns.find((col) => col.name === name) as AdvancedQueryColumn;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPreference = async (token: string) => {
  try {
    return await window
      .fetch(api.routes.USERPREFERENCE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      })
      .then((response) => {
        return response.json();
      });
  } catch (err) {
    console.log(err);
  }
};
