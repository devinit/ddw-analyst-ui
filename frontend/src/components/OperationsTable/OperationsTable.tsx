import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import { OperationMap } from '../../types/operations';
import { OperationsTableRow } from '../OperationsTableRow';

interface OperationsTableProps {
  operations: List<OperationMap>;
  onRowClick: (operation: OperationMap) => void;
}

export class OperationsTable extends React.Component<OperationsTableProps> {
  render() {
    return (
      <Table responsive hover striped className="operations-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Updated On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          { this.renderRows(this.props.operations) }
        </tbody>
      </Table>
    );
  }

  private renderRows(operations: List<OperationMap>) {
    if (operations && operations.size) {
      return operations.map((operation, index) => (
        <OperationsTableRow
          key={ index }
          count={ index + 1 }
          onClick={ () => this.props.onRowClick(operation) }
          name={ operation.get('name') as string }
          updatedOn={ operation.get('updated_on') as string }
        />
      ));
    }

    return null;
  }
}
