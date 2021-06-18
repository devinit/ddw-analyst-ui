import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryOptions } from '../../../types/operations';
import { ICheck, ICheckData } from '../../ICheck';

interface SelectAllColumnSelectorProps {
  setShowColumnSelector?: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
}

const SelectAllColumnSelector: FunctionComponent<SelectAllColumnSelectorProps> = ({ ...props }) => {
  const [selectAll, setSelectAll] = useState(true);
  useEffect(() => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        selectAll: selectAll,
      });
    }
  }, []);
  const onChange = (data: ICheckData) => {
    setSelectAll(data.checked);
    if (props.onUpdateOptions) {
      props.onUpdateOptions({ selectAll: data.checked });
    }
  };

  return (
    <ICheck
      id="selectAll"
      name="selectAll"
      label="Select All"
      onChange={onChange}
      variant="danger"
      checked={props.selectAll || selectAll}
    />
  );
};

export { SelectAllColumnSelector };
