import { ReactNode } from 'react';

interface ParsedOption {
  id: string;
  values: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type SelectColumn = { text?: ReactNode; value?: string | number | boolean | undefined };

const getColumnAlias = (columnName: string, columns: SelectColumn[]): string => {
  const matchingColumn = columns.find((column) => column.value === columnName);

  return matchingColumn && typeof matchingColumn.text === 'string'
    ? matchingColumn.text
    : columnName;
};

export const validateSelectColumnDeselect = (
  options: string,
  checkboxValue: string,
  columns: SelectColumn[],
): Promise<string> => {
  return new Promise((resolve: (validationMessage: string) => void) => {
    const parsedOptions = parseOptions(options);
    const validationMessage = (columnName: string, queryName: string) =>
      `${columnName
        .split('_')
        .join(
          ' ',
        )} is used in a subsequent ${queryName} step. Deselecting it here may break this query.`;

    parsedOptions?.values?.flat().reduce(function (result, query) {
      if (query && query.field === checkboxValue && parsedOptions.id === 'filters') {
        resolve(validationMessage(getColumnAlias(query.field, columns), 'filter'));
      }
      if (query && query.operational_column === checkboxValue && parsedOptions.id === 'aggregate') {
        resolve(validationMessage(getColumnAlias(query.operational_column, columns), 'aggregate'));
      }
      if (parsedOptions.id === 'join_on') {
        const keys = Object.keys(query.join_on);
        for (const iterator of keys) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(getColumnAlias(iterator, columns), 'join'));
            break;
          }
        }
      }
      if (query && query.operational_column === checkboxValue && parsedOptions.id === 'scalar') {
        resolve(validationMessage(getColumnAlias(query.operational_column, columns), 'scalar'));
      }
      if (query && query.operational_columns && parsedOptions.id === 'multi') {
        for (const iterator of query.operational_columns) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(getColumnAlias(iterator, columns), 'multi'));
            break;
          }
        }
      }
      if (query && query.over && parsedOptions.id === 'window') {
        for (const iterator of query.columns) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(getColumnAlias(iterator, columns), 'window'));
            break;
          }
        }
      }

      return result;
    }, []);
  });
};

const parseOptions = (options: string): ParsedOption | undefined => {
  const parsedOptions = JSON.parse(options);
  if (parsedOptions.hasOwnProperty('filters')) {
    return { id: 'filters', values: [parsedOptions.filters] };
  }
  if (parsedOptions.hasOwnProperty('join_on')) {
    return { id: 'join_on', values: [parsedOptions] };
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    !parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    return { id: 'aggregate', values: [parsedOptions] };
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    return { id: 'scalar', values: [parsedOptions] };
  }
  if (parsedOptions.hasOwnProperty('operational_columns')) {
    return { id: 'multi', values: [parsedOptions] };
  }
  if (parsedOptions.hasOwnProperty('over')) {
    return { id: 'window', values: [parsedOptions] };
  }
};
