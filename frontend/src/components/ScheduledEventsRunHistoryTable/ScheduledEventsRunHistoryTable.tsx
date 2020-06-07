import React, { FunctionComponent, ReactNode } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';

interface ScheduledEventsRunHistoryTableProps {
  data: object;
}
export const ScheduledEventsRunHistoryTable: FunctionComponent<ScheduledEventsRunHistoryTableProps> = (
  props,
) => {
  const renderRows = (): ReactNode =>
    props.data ? props.data.map((history, index: number) => {
          return (
            <ScheduledEventsRunHistoryTableRow
              key={index}
              status={history.status}
              started={history.start_at}
              ended={history.ended_at}
            />
          );
        })
      : null;

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
