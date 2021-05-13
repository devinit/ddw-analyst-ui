import { Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ColumnList, SourceMap } from '../../../types/sources';
import { sortObjectArrayByProperty } from '../../../utils';
import { CheckboxGroup, CheckboxGroupOption } from '../../CheckboxGroup';
import { QueryBuilderHandler } from '../../QueryBuilderHandler';

interface ColumnSelectorProps {
  show?: boolean;
  source: SourceMap;
}
type CheckOption = CheckboxGroupOption;

const getColumnGroupOptionsFromSource = (source: SourceMap): CheckOption[] => {
  const columnsList = source.get('columns') as ColumnList;
  const columnSet = Set(columnsList.map((column) => column.get('name') as string));

  return QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columnsList) as CheckOption[];
};

const ColumnSelector: FunctionComponent<ColumnSelectorProps> = ({ source, show }) => {
  const [columns, setColumns] = useState<CheckOption[]>([]);
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    setColumns(getColumnGroupOptionsFromSource(source));
  }, []);

  if (show) {
    return (
      <CheckboxGroup
        options={columns.sort(sortObjectArrayByProperty('text').sort)}
        // selectedOptions={columns}
        // onUpdateOptions={onUpdateColumns}
      />
    );
  }

  return null;
};

ColumnSelector.defaultProps = { show: true };

export { ColumnSelector };
