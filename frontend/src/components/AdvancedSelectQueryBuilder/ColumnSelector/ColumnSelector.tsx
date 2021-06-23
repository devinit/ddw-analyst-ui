import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { sortObjectArrayByProperty } from '../../../utils';
import { CheckboxGroup } from '../../CheckboxGroup';
import { CheckOption, cleanColumn, getColumnGroupOptionsFromSource } from './utils';

interface ColumnSelectorProps {
  show?: boolean;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  usage?: 'select' | 'groupby';
  nameOnly?: boolean;
  onUpdateSelection?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
}

const ColumnSelector: FunctionComponent<ColumnSelectorProps> = ({ source, show, ...props }) => {
  const [columns, setColumns] = useState<CheckOption[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    props.columns.map((column) => column.name as string),
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    setColumns(getColumnGroupOptionsFromSource(source));
  }, [source]);
  useEffect(() => {
    if (props.columns.length === 0) {
      setSelectedColumns([]);
    }
  }, [props.columns]);
  const onUpdateColumns = (selection: string[]) => {
    setSelectedColumns(selection);
    if (props.onUpdateSelection) {
      props.onUpdateSelection({
        [props.usage === 'select' ? 'columns' : 'groupby']: selection
          .map((col) => {
            return (source.get('columns') as ColumnList)
              .find((column) => column.get('name') === col)
              ?.toJS();
          })
          .map((column: Column) =>
            props.nameOnly ? column.name : cleanColumn(column, props.columns),
          ),
      });
    }
  };

  if (show) {
    return (
      <CheckboxGroup
        options={columns.sort(sortObjectArrayByProperty('text').sort)}
        selectedOptions={selectedColumns}
        onUpdateOptions={onUpdateColumns}
      />
    );
  }

  return null;
};

ColumnSelector.defaultProps = { show: true, usage: 'select' };

export { ColumnSelector };
