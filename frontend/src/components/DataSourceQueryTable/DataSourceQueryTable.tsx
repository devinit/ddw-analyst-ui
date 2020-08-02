import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
// import { DataSourceQueryRow } from '../../components/DataSourceQueryRow';

export const DataSourceQueryTable: FunctionComponent = () => {
  //   const renderRow = () => {
  //     return <DataSourceQueryRow />;
  //   };

  return (
    <Table responsive hover striped className="sources-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Updated On</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>datasourcequery</tbody>
    </Table>
  );
};
