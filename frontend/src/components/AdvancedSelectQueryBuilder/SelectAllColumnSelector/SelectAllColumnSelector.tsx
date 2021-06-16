import React, { FunctionComponent, useEffect } from 'react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
import { ICheckData } from '../../ICheck';
import { IRadio } from '../../IRadio';
import { cleanColumn } from '../ColumnSelector/utils';

interface SelectAllColumnSelectorProps {
  setShowColumnSelector?: React.Dispatch<React.SetStateAction<boolean>>;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
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
    if (props.onUpdateOptions) {
      props.onUpdateOptions({ selectAll: data.checked });
    }
  };

  return (
    <IRadio
      id="selectAll"
      name="selectAll"
      label="Select All"
      onChange={onCheckBoxChange}
      variant="danger"
      checked={props.selectAll || false}
    />
  );
};

export { SelectAllColumnSelector };
