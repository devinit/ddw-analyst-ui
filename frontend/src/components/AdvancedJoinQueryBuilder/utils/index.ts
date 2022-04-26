import { Set } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';
import { AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
import { QueryBuilderHandler } from '../../QueryBuilderHandler';

export const hasJoinConfig = (options: AdvancedQueryOptions): boolean => !!options.join;
export const joinTypes: DropdownItemProps[] = [
  { key: 'inner', text: 'Inner Join', value: 'inner' },
  { key: 'outer', text: 'Outer Join', value: 'outer' },
  { key: 'left', text: 'Left Join', value: 'left' },
  { key: 'right', text: 'Right Join', value: 'right' },
  { key: 'full', text: 'Full Join', value: 'full' },
  { key: 'cross', text: 'Cross Join', value: 'cross' },
  { key: 'left_outer', text: 'Left Outer Join', value: 'left_outer' },
  { key: 'right_outer', text: 'Right Outer Join', value: 'right_outer' },
];

export const getSourceColumns = (
  source: SourceMap,
  asDropdownItems = false,
): DropdownItemProps[] | ColumnList => {
  const columns = source.get('columns') as ColumnList;
  if (asDropdownItems) {
    const columnSet = Set(columns.map((column) => column.get('name') as string));

    return QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);
  }

  return columns;
};

export const checkIfMappingExists = (
  columnMapping: [string, string][],
  map: [string, string],
): [string, string][] => {
  return columnMapping.filter((mapping) => {
    return mapping[0] === map[0] && mapping[1] === map[1];
  });
};
