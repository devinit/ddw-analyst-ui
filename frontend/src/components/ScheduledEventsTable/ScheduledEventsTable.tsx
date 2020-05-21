import * as React from 'react';
import { Table } from 'react-bootstrap';

export const ScheduledEventsTable = () => {
  return (
    <Table responsive table-striped className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Interval</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </Table>
  );
};
