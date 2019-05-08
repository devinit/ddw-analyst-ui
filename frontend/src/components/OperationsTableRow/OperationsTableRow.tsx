import * as React from 'react';
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
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;
const StyledActionCell = styled.td`
  display: block !important;
`;

export class OperationsTableRow extends React.Component<OperationsTableRowProps> {
  static Actions = OperationsTableRowActions;

  render() {
    return (
      <StyledRow className={ this.props.classNames } onClick={ this.props.onClick } data-testid="operations-table-row">
        <td>{ this.props.name }</td>
        <td>{ new Date(this.props.updatedOn).toDateString() }</td>
        <td>
          <Badge variant={ this.props.isDraft ? 'warning' : 'danger' }>
            { this.props.isDraft ? 'Draft' : 'Published' }
          </Badge>
        </td>
        <StyledActionCell className="td-actions text-right">{ this.renderActions() }</StyledActionCell>
      </StyledRow>
    );
  }

  private renderActions(): React.ReactNode {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === OperationsTableRowActions) {
        return child;
      }
    });
  }
}
