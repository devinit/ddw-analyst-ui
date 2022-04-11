import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import {
  AdvancedQueryColumn,
  AdvancedQueryJoin,
  AdvancedQueryOptions,
} from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { AdvancedQueryContext } from '../../QuerySentenceBuilder';
import { SelectColumnOrder, SelectedColumn } from '../../SelectColumnOrder';

interface ColumnOrderProps {
  show: boolean;
  columns: AdvancedQueryColumn[];
  source: SourceMap;
  usage?: 'select' | 'join';
  activeJoinIndex: number;
}

const getColumnPropertyByName = (source: SourceMap, columnName: string, property: keyof Column) =>
  (source.get('columns') as ColumnList)
    .find((column) => column.get('name') === columnName)
    ?.get(property);

const AdvancedQueryBuilderColumnOrder: FunctionComponent<ColumnOrderProps> = ({
  activeJoinIndex,
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
      if (props.usage === 'join' && options.join && options.join.length) {
        options.join[activeJoinIndex] = {
          ...options.join[activeJoinIndex],
          ...updatedOptions,
        };
      }
      updateOptions(
        props.usage === 'select'
          ? updatedOptions
          : ({ join: [...(options.join as AdvancedQueryJoin[])] } as AdvancedQueryOptions),
      );
    }
  };

  return props.show ? (
    <SelectColumnOrder selectedColumns={selectedColumns} onUpdateColumns={onUpdateColumns} />
  ) : null;
};

AdvancedQueryBuilderColumnOrder.defaultProps = { usage: 'select' };

export { AdvancedQueryBuilderColumnOrder };
