import * as React from 'react';
import styled from 'styled-components';
import OperationsTableRowActions from '../OperationsTableRowActions';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  classNames?: string;
  onClick?: () => void;
}

const StyledRow = styled.tr`
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;

export class OperationsTableRow extends React.Component<OperationsTableRowProps> {
  static Actions = OperationsTableRowActions;

  render() {
    return (
      <StyledRow className={ this.props.classNames } onClick={ this.props.onClick } data-testid="operations-table-row">
        <td>{ this.props.name }</td>
        <td>{ new Date(this.props.updatedOn).toDateString() }</td>
        <td className="td-actions text-right">{ this.renderActions() }</td>
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
