import { DropdownItemProps } from 'semantic-ui-react';
import { findBestMatch } from 'string-similarity';
import { UpdateTableColumn } from '../../../utils';
import { Column } from '../../FileInput';

export const getDefaultColumnMapping = (
  columns: Column[],
  tableColumns: UpdateTableColumn[],
): Column[] => {
  const dataSourceColumnNames = tableColumns.map((column) => column.name);

  return columns.map((column) => {
    const results = findBestMatch(column.name, dataSourceColumnNames);
    if (results.bestMatch.rating >= 0.5) {
      column.tableProperty = tableColumns.find(
        (column) => column.name === results.bestMatch.target,
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
      (column) => column.tableProperty && column.tableProperty.name === option.value,
    );
    if (mappedColumn) {
      option.disabled = true;
    }

    return option;
  });
};
