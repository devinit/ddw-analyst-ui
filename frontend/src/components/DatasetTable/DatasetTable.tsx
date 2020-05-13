import * as React from 'react';
import { Table } from 'react-bootstrap';
import { DatasetTableRow } from '../DatasetTableRow';

export const DatasetTable: React.SFC = (props) => {
  const renderRows = () => {
    return React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type === DatasetTableRow) {
        return child;
      }
    });
  };

  return (
    <Table responsive hover striped className="sources-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Publication</th>
          <th>Release Date</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};

export { DatasetTable as default };
