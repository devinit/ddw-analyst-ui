import React, { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { AdvancedQueryOptions } from '../../../types/operations';

interface SelectAllColumnSelectorProps {
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
}

const ColumnReset: FunctionComponent<SelectAllColumnSelectorProps> = ({ ...props }) => {
  const onReset = () => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: [],
        selectAll: false,
      });
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={onReset} className="mr-1 ml-1">
      Clear/Reset
    </Button>
  );
};

export { ColumnReset };
