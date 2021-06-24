import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { SelectColumnOrder, SelectedColumn } from '../../SelectColumnOrder';

interface ColumnOrderProps {
  show: boolean;
  columns: AdvancedQueryColumn[];
  source: SourceMap;
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
}

const getColumnPropertyByName = (source: SourceMap, columnName: string, property: keyof Column) =>
  (source.get('columns') as ColumnList)
    .find((column) => column.get('name') === columnName)
    ?.get(property);

const AdvancedQueryBuilderColumnOrder: FunctionComponent<ColumnOrderProps> = ({
  columns,
  source,
  ...props
}) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumn[]>([]);
  useEffect(() => {
    if (columns) {
      setSelectedColumns(
        columns.map((column) => ({
          alias: column.alias as string,
          columnName: column.name as string,
        })),
      );
    }
  }, [columns]);
  const onUpdateColumns = (options: string) => {
    const orderedColumns: SelectedColumn[] = JSON.parse(options).columns.map((column: string) => ({
      alias: getColumnPropertyByName(source, column, 'alias'),
      columnName: column,
    }));
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: orderedColumns.map(({ alias, columnName: name }) => ({
          id: getColumnPropertyByName(source, name, 'id'),
          name,
          alias,
        })) as AdvancedQueryColumn[],
      });
    }
  };

  return props.show ? (
    <SelectColumnOrder selectedColumns={selectedColumns} onUpdateColumns={onUpdateColumns} />
  ) : null;
};

export { AdvancedQueryBuilderColumnOrder };
