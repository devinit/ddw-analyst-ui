import * as React from 'react';
import OperationsTableRowActions from '../OperationsTableRowActions';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  classNames?: string;
  onClick: () => void;
}

export class OperationsTableRow extends React.Component<OperationsTableRowProps> {
  static Actions = OperationsTableRowActions;

  render() {
    return (
      <tr className={ this.props.classNames } onClick={ this.props.onClick } data-testid="operations-table-row">
        <td>{ this.props.name }</td>
        <td>{ new Date(this.props.updatedOn).toDateString() }</td>
        <td className="td-actions text-right">{ this.renderActions() }</td>
      </tr>
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
