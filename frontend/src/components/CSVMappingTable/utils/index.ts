import { findBestMatch } from 'string-similarity';
import { ColumnList } from '../../../types/sources';
import { Column } from '../../FileInput';
import { DropdownItemProps } from 'semantic-ui-react';

export const getDefaultColumnMapping = (
  columns: Column[],
  dataSourceColumns: ColumnList,
): Column[] => {
  const dataSourceColumnNames = dataSourceColumns.map((column) => column.get('name') as string);

  return columns.map((column) => {
    const results = findBestMatch(column.name, dataSourceColumnNames.toJS());
    if (results.bestMatch.rating >= 0.5) {
      column.dataSourceProperty = dataSourceColumns.find(
        (column) => column.get('name') === results.bestMatch.target,
      );
    }

    return column;
  });
};

export const disableSelectedColumns = (
  options: DropdownItemProps[],
  columns: Column[],
): DropdownItemProps[] => {
  return options.map((option) => {
    const mappedColumn = columns.find(
      (column) =>
        column.dataSourceProperty && column.dataSourceProperty.get('name') === option.value,
    );
    if (mappedColumn) {
      option.disabled = true;
    }

    return option;
  });
};
