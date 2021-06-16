import React, { FunctionComponent, useEffect } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
import { ICheck, ICheckData } from '../../ICheck';
import { cleanColumn } from '../ColumnSelector/utils';

interface SelectAllColumnSelectorProps {
  setShowColumnSelector?: React.Dispatch<React.SetStateAction<boolean>>;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
  setSelectAll?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectAllColumnSelector: FunctionComponent<SelectAllColumnSelectorProps> = ({
  source,
  ...props
}) => {
  useEffect(() => {
    if (props.selectAll === true && props.setShowColumnSelector && props.onUpdateOptions) {
      props.setShowColumnSelector(true);
      props.onUpdateOptions({
        columns: (source.get('columns') as ColumnList)
          .toJS()
          .map((column) => cleanColumn(column, props.columns ? props.columns : [])),
        selectAll: true,
      });
    } else {
      if (props.onUpdateOptions) {
        props.onUpdateOptions({
          columns: [],
          selectAll: false,
        });
      }
    }
  }, [props.selectAll]);
  const onCheckBoxChange = (data: ICheckData) => {
    if (props.setSelectAll) {
      props.setSelectAll(data.checked);
    }
  };

  return (
    <ICheck
      id="selectAll"
      name="selectAll"
      label="Select All"
      onChange={onCheckBoxChange}
      variant="danger"
      checked={props.selectAll}
    />
  );
};

export { SelectAllColumnSelector };
