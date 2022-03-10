import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { sortObjectArrayByProperty } from '../../../utils';
import { CheckboxGroup } from '../../CheckboxGroup';
import { AdvancedQueryContext } from '../../QuerySentenceBuilder';
import { CheckOption, cleanColumn, getColumnGroupOptionsFromSource } from './utils';

interface ColumnSelectorProps {
  show?: boolean;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  usage?: 'select' | 'groupby' | 'join';
  nameOnly?: boolean; // when true, only the column name is added to the target array
  onSelectColumns?: (options: Partial<AdvancedQueryOptions>) => void;
}

const ColumnSelector: FunctionComponent<ColumnSelectorProps> = ({
  onSelectColumns,
  source,
  show,
  ...props
}) => {
  const { updateOptions } = useContext(AdvancedQueryContext);
  const [columns, setColumns] = useState<CheckOption[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    props.columns.map((column) => column.name as string),
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    const sourceColumns = getColumnGroupOptionsFromSource(source);
    if (props.usage === 'groupby' && options.columns) {
      const groupByColumns = sourceColumns.filter((column) =>
        options.columns?.find((col) => !col.aggregate && col.name === column.value),
      );
      setColumns(groupByColumns);
    } else {
      setColumns(sourceColumns);
    }
  }, [source]);
  useEffect(() => {
    if (props.columns.length === 0) setSelectedColumns([]);
  }, [props.columns]);

  const onUpdateColumns = (selection: string[]) => {
    setSelectedColumns(selection);
    const updatedOptions: Partial<AdvancedQueryOptions> = {
      [props.usage === 'select' || props.usage === 'join' ? 'columns' : 'groupby']: selection
        .map(
          (col) =>
            (source.get('columns') as ColumnList)
              .find((column) => column.get('name') === col)
              ?.toJS() as unknown as Column,
        )
        .filter((column) => !!column) // ensure no null or undefined values go through
        .map((column: Column) =>
          props.nameOnly ? column.name : cleanColumn(column, props.columns),
        ),
    };

    if (props.usage !== 'join') {
      updateOptions!(updatedOptions);
    } else {
      onSelectColumns!(updatedOptions);
    }
  };

  if (show) {
    return (
      <CheckboxGroup
        options={columns.sort(sortObjectArrayByProperty('text').sort)}
        selectedOptions={selectedColumns}
        onUpdateOptions={onUpdateColumns}
        selectAll
        rowSize={6}
      />
    );
  }

  return null;
};

ColumnSelector.defaultProps = { show: true, usage: 'select' };

export { ColumnSelector };
