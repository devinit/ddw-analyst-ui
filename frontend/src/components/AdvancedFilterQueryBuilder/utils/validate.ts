import { DropdownItemProps } from 'semantic-ui-react';
import { AdvancedQueryFilter, comp } from '../../../types/operations';
import { EditorContent } from '../FilterWithAndOr';

export type ValidationResponse = 'invalid' | 'create' | 'update';

const comparatorKeys = ['$and', '$or'];
const validKeys = ['column', 'comp', 'value'].concat(comparatorKeys);

export const validateFilter = (
  filter: AdvancedQueryFilter,
  columns: DropdownItemProps[],
): string[] => [...validateOperators(filter), ...validateColumns(filter, columns)];

const validateOperators = (filterOptions: AdvancedQueryFilter): string[] => {
  let messages: string[] = [];

  for (const key in filterOptions) {
    if (!comparatorKeys.includes(key)) {
      messages.push(`${key} is not a valid comparator`);
    } else {
      const filter = (filterOptions as any)[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const index in filter) {
        const filterKeys = Object.keys(filter[index]);
        // check if this is a deeper nested filter
        if (filterKeys.filter((f) => comparatorKeys.includes(f)).length) {
          messages = messages.concat(validateOperators(filter[index]));
        } else {
          // validate keys
          filterKeys.forEach((key) => {
            if (!validKeys.includes(key)) {
              messages.push(`Key ${key} is invalid`);
            }
          });
          // validate operator
          const operator = filter[index]['comp'];
          if (operator && !comp.includes(operator)) {
            messages.push(`The operator ${operator} is invalid.`);
          }
          if (!operator) {
            messages.push('Operator is required');
          }
        }
      }
    }
  }

  return messages.length > 0 ? messages : [];
};

const validateColumns = (
  filterOptions: AdvancedQueryFilter,
  columns: DropdownItemProps[],
): string[] => {
  const selectedColumns: string[] = [];
  const allColumns: string[] = [];
  let messages: string[] = [];

  for (const key in filterOptions) {
    const filter = (filterOptions as any)[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const index in filter) {
      const filterKeys = Object.keys(filter[index]);
      if (filterKeys.filter((f) => comparatorKeys.includes(f)).length) {
        messages = messages.concat(validateColumns(filter[index], columns));
      } else {
        selectedColumns.push(filter[index]['column']);
      }
    }
  }

  for (let key = 0; key < columns.length; key++) {
    allColumns.push(columns[key].value as string);
  }

  messages = messages.concat(
    selectedColumns
      .filter((column) => !allColumns.includes(column))
      .map((column) => (column ? `${column} is not a valid column name.` : 'column is required')),
  );

  return messages;
};

export const isEditorContentEmpty = (obj: EditorContent): boolean => {
  for (const value of Object.values(obj)) {
    if (value && value.length > 0) {
      return false;
    }
  }

  return true;
};
