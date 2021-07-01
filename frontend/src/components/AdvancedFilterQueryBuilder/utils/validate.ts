import { fromJS } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';
import { AdvancedQueryFilter, comp } from '../../../types/operations';
import { EditorContent } from '../FilterWithAndOr';

export type ValidationResponse = 'invalid' | 'create' | 'update';

export const validateFilter = (
  filter: AdvancedQueryFilter,
  columns: DropdownItemProps[],
): string[] => [
  ...validateOperators(filter),
  ...validateColumns(filter, columns),
  ...validateAndOr(filter),
];

export const validateOperators = (filterOptions: AdvancedQueryFilter): string[] => {
  const messages: string[] = [];

  for (const key in filterOptions) {
    const filter = (filterOptions as any)[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const index in filter) {
      if (!comp.includes(filter[index]['comp'])) {
        messages.push(`The operator ${filter[index]['comp']} is invalid.`);
      }
    }
  }

  return messages.length > 0 ? messages : [];
};

export const validateColumns = (
  filterOptions: AdvancedQueryFilter,
  columns: DropdownItemProps[],
): string[] => {
  let selectedColumns: string[] = [];
  const allColumns: string[] = [];

  for (const key in filterOptions) {
    const filter = (filterOptions as any)[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const index in filter) {
      selectedColumns.push(filter[index]['column']);
    }
  }

  for (let key = 0; key < columns.length; key++) {
    allColumns.push(columns[key].value as string);
  }

  selectedColumns = selectedColumns
    .filter((column) => !allColumns.includes(column))
    .map((column) => (column ? `${column} is not a valid column name.` : 'column is required'));

  return selectedColumns;
};

export const validateAndOr = (content: EditorContent): string[] => {
  const validKeys = ['$and', '$or'];
  const invalidKeys: string[] = [];
  fromJS(content).mapKeys((key: string) => {
    if (!validKeys.includes(key)) {
      invalidKeys.push(`${key} is not a valid comparator`);
    }
  });

  return invalidKeys;
};

export const isEditorContentEmpty = (obj: EditorContent): boolean => {
  for (const value of Object.values(obj)) {
    if (value && value.length > 0) {
      return false;
    }
  }

  return true;
};
