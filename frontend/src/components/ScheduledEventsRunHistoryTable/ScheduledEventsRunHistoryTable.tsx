import React, { FunctionComponent, ReactNode } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';

export const ScheduledEventsRunHistoryTable: FunctionComponent = () => {
  const renderRows = (): ReactNode => {
    return <ScheduledEventsRunHistoryTableRow />;
  };

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>Status</th>
          <th>Started</th>
          <th>Ended</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
