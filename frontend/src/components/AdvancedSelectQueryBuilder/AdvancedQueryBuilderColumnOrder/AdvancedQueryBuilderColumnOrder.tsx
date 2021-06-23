import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
import { SelectColumnOrder } from '../../SelectColumnOrder';

interface ColumnOrderProps {
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  show: boolean;
  columns: AdvancedQueryColumn[];
  source: SourceMap;
}

const AdvancedQueryBuilderColumnOrder: FunctionComponent<ColumnOrderProps> = ({
  show,
  columns,
  source,
  ...props
}) => {
  const [selectedColumns, setSelectedColumns] = useState<{ alias: string; columnName: string }[]>(
    [],
  );
  useEffect(() => {
    if (columns) {
      setSelectedColumns(
        columns.map((column) => {
          return { alias: column.alias as string, columnName: column.name as string };
        }),
      );
    }
  }, [columns]);
  const onUpdateColumns = (options: string) => {
    const orderedColumns = JSON.parse(options).columns.map((column: string) => {
      return {
        alias: (source.get('columns') as ColumnList)
          .find((sourceColumn) => sourceColumn.get('name') === column)
          ?.get('alias'),
        columnName: column,
      };
    });
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: orderedColumns.map((column: { alias: string; columnName: string }) => {
          return {
            id: (source.get('columns') as ColumnList)
              .find((sourceColumn) => sourceColumn.get('name') === column.columnName)
              ?.get('id'),
            name: column.columnName,
            alias: column.alias,
          };
        }) as AdvancedQueryColumn[],
      });
    }
  };

  if (show) {
    return (
      <SelectColumnOrder selectedColumns={selectedColumns} onUpdateColumns={onUpdateColumns} />
    );
  }

  return null;
};

export { AdvancedQueryBuilderColumnOrder };
