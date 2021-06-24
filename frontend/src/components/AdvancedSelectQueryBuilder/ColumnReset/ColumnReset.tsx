import React, { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { AdvancedQueryOptions } from '../../../types/operations';

interface SelectAllColumnSelectorProps {
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  setDisplayColumnSelector?: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplaySelectColumnOrder?: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplayAggregateColumn?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ColumnReset: FunctionComponent<SelectAllColumnSelectorProps> = ({ ...props }) => {
  const onReset = () => {
    if (
      props.onUpdateOptions &&
      props.setDisplayColumnSelector &&
      props.setDisplaySelectColumnOrder &&
      props.setDisplayAggregateColumn
    ) {
      props.setDisplayColumnSelector(false);
      props.setDisplaySelectColumnOrder(false);
      props.setDisplayAggregateColumn(false);
      props.onUpdateOptions({
        selectAll: true,
        columns: [],
      });
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={onReset}>
      Clear/Reset
    </Button>
  );
};

export { ColumnReset };
