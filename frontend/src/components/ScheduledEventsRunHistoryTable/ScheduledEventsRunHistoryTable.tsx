import React, { FunctionComponent, ReactNode } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';

interface ScheduledEventRunHistoryTableProps {
  data: ScheduledEventRunHistory[];
}
export const ScheduledEventsRunHistoryTable: FunctionComponent<ScheduledEventRunHistoryTableProps> = (
  props,
): React.ReactElement => {
  const renderRows = (): ReactNode =>
    props.data
      ? props.data.map((history: ScheduledEventRunHistory, index: number) => (
          <ScheduledEventsRunHistoryTableRow key={index} history={history} />
        ))
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
