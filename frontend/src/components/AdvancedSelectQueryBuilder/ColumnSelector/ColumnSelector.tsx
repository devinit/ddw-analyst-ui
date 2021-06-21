import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
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
    if (props.onUpdateSelection && props.selectAll === false) {
      props.onUpdateSelection({
        [props.usage === 'select' ? 'columns' : 'groupby']: (source.get('columns') as ColumnList)
          .filter((column) => selection.includes(column.get('name') as string))
          .toJS()
          .map((column) => (props.nameOnly ? column.name : cleanColumn(column, props.columns))),
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
