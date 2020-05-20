import * as React from 'react';
import { Table } from 'react-bootstrap';

export class ScheduledEventsTable extends React.Component {
  render() {
    return (
      <Table responsive hover striped className="sources-table">
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
  }
}
