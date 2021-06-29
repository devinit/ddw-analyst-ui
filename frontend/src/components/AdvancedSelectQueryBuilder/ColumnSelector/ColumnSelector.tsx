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
}

const ColumnSelector: FunctionComponent<ColumnSelectorProps> = ({ source, show, ...props }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [columns, setColumns] = useState<CheckOption[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    props.columns.map((column) => column.name as string),
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    setColumns(getColumnGroupOptionsFromSource(source));
  }, [source]);
  useEffect(() => {
    if (props.columns.length === 0) setSelectedColumns([]);
  }, [props.columns]);

  const onUpdateColumns = (selection: string[]) => {
    setSelectedColumns(selection);
    const updatedOptions: Partial<AdvancedQueryOptions> = {
      [props.usage === 'select' || props.usage === 'join' ? 'columns' : 'groupby']: selection
        .map((col) =>
          (source.get('columns') as ColumnList)
            .find((column) => column.get('name') === col)
            ?.toJS(),
        )
        .map((column: Column) =>
          props.nameOnly ? column.name : cleanColumn(column, props.columns),
        ),
    };
    updateOptions!(
      props.usage !== 'join'
        ? updatedOptions
        : ({ join: { ...options.join, ...updatedOptions } } as AdvancedQueryOptions),
    );
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
