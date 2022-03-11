import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { AdvancedQueryContext } from '../../QuerySentenceBuilder';
import { SelectColumnOrder, SelectedColumn } from '../../SelectColumnOrder';

interface ColumnOrderProps {
  show: boolean;
  columns: AdvancedQueryColumn[];
  source: SourceMap;
  usage?: 'select' | 'join';
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
  const { options, updateOptions } = useContext(AdvancedQueryContext);
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
  const onUpdateColumns = (config: string) => {
    const orderedColumns: SelectedColumn[] = JSON.parse(config).columns.map((column: string) => ({
      alias: getColumnPropertyByName(source, column, 'alias'),
      columnName: column,
    }));
    if (updateOptions) {
      const updatedOptions: Partial<AdvancedQueryOptions> = {
        columns: orderedColumns.map(
          ({ columnName: name }) => columns.find((col) => col.name === name) as AdvancedQueryColumn,
        ),
      };
      updateOptions(
        props.usage === 'select'
          ? updatedOptions
          : ({ join: { ...options.join, ...updatedOptions } } as AdvancedQueryOptions),
      );
    }
  };

  return props.show ? (
    <SelectColumnOrder selectedColumns={selectedColumns} onUpdateColumns={onUpdateColumns} />
  ) : null;
};

AdvancedQueryBuilderColumnOrder.defaultProps = { usage: 'select' };

export { AdvancedQueryBuilderColumnOrder };
