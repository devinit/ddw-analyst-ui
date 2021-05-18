import { Set } from 'immutable';
import { AdvancedQueryColumn } from '../../../../types/operations';
import { SourceMap, ColumnList, Column } from '../../../../types/sources';
import { CheckboxGroupOption } from '../../../CheckboxGroup';
import { QueryBuilderHandler } from '../../../QueryBuilderHandler';

export type CheckOption = CheckboxGroupOption;

export const getColumnGroupOptionsFromSource = (source: SourceMap): CheckOption[] => {
  const columnsList = source.get('columns') as ColumnList;
  const columnSet = Set(columnsList.map((column) => column.get('name') as string));

  return QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columnsList) as CheckOption[];
};

export const cleanColumn = (
  { id, name, alias }: Column,
  selectedColumns: AdvancedQueryColumn[],
): AdvancedQueryColumn => {
  const matchingColumn = selectedColumns.find((col) => name === col.name);

  return matchingColumn ? { ...matchingColumn, id, name } : { id, name, alias };
};
