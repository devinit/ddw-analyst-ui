import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { OperationsTableRow } from '../OperationsTableRow';

export const OperationsTable: FunctionComponent = (props) => {
  const renderRows = () =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type === OperationsTableRow) {
        return child;
      }
    });

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
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
