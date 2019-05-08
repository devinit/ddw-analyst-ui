import * as React from 'react';
import { Table } from 'react-bootstrap';
import { OperationsTableRow } from '../OperationsTableRow';
import OperationsTableRowActions from '../OperationsTableRowActions';

export class OperationsTable extends React.Component {
  static Row = OperationsTableRow;
  static Actions = OperationsTableRowActions;

  render() {
    return (
      <Table responsive hover striped className="operations-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Updated On</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          { this.renderRows() }
        </tbody>
      </Table>
    );
  }

  private renderRows() {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === OperationsTableRow) {
        return child;
      }
    });
  }
}
