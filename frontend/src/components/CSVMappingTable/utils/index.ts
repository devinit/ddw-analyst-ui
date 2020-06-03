import { findBestMatch } from 'string-similarity';
import { ColumnList } from '../../../types/sources';
import { Column } from '../../FileInput';

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
