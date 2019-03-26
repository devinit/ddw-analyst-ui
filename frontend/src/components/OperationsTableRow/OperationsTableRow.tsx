import * as React from 'react';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  classNames?: string;
  onClick: () => void;
}

export const OperationsTableRow: React.SFC<OperationsTableRowProps> = props => {
  return (
    <tr className={ props.classNames } onClick={ props.onClick } data-testid="operations-table-row">
      <td>{ props.count }</td>
      <td>={ props.name }</td>
      <td>{ new Date(props.updatedOn).toDateString() }</td>
      <td>Actions Go Here!</td>
    </tr>
  );
};
