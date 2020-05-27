import * as React from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow/ScheduledEventsTableRow';
import { ScheduledEvent } from '../../types/scheduledEvents';

export const ScheduledEventsTable = (props: any) => {
  const offset = (props.currentPage - 1) * props.pageLimit;

  const renderRows = () =>
    props.events.map((event: ScheduledEvent, index: number) => {
      return (
        <ScheduledEventsTableRow
          key={index}
          id={offset + index + 1}
          name={event.name}
          description={event.description || ''}
          enabled={event.enabled}
          interval={event.interval}
          interval_type={event.interval_type}
          repeat={event.repeat}
          start_date={event.start_date}
        />
      );
    });

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th className="text-center">#</th>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Interval</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
