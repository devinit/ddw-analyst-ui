import * as React from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow/ScheduledEventsTableRow';
import { ScheduledEvent } from '../../types/scheduledEvents';

export const ScheduledEventsTable = (props: any) => {
  const renderRows = () => {
    return props.events.map((event: ScheduledEvent, index: number) => {
      return (
        <ScheduledEventsTableRow
          key={index}
          id={event.id}
          name={event.name}
          description={event.description || ''}
          enabled={event.enabled}
          interval={event.interval || ''}
          actions={event.actions}
        />
      );
    });
  };

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th className="text-center">#</th>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Interval</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
