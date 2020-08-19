import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import OperationsTableRowActions from '../OperationsTableRowActions';
import { Badge } from 'react-bootstrap';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  isDraft: boolean;
  classNames?: string;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
}

const StyledRow = styled.tr`
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;
const StyledActionCell = styled.td`
  display: block !important;
`;

export const OperationsTableRow: FunctionComponent<OperationsTableRowProps> = (props) => {
  const renderActions = (): React.ReactNode =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type === OperationsTableRowActions) {
        return child;
      }
    });

  return (
    <StyledRow
      className={props.classNames}
      onClick={props.onClick}
      data-testid="operations-table-row"
    >
      <td>{props.name}</td>
      <td>{new Date(props.updatedOn).toDateString()}</td>
      <td>
        <Badge variant={props.isDraft ? 'warning' : 'danger'}>
          {props.isDraft ? 'Draft' : 'Published'}
        </Badge>
      </td>
      <StyledActionCell className="td-actions text-right">{renderActions()}</StyledActionCell>
    </StyledRow>
  );
};
