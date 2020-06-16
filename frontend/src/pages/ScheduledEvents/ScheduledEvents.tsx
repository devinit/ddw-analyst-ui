import React, { FunctionComponent, useState } from 'react';
import { Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsRunHistoryTableCard } from '../../components/ScheduledEventsRunHistoryTableCard';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';
import { ScheduledEvent } from '../../types/scheduledEvents';

type ScheduledEventsProps = RouteComponentProps;

const ScheduledEvents: FunctionComponent<ScheduledEventsProps> = () => {
  const [rowId, setRowId] = useState(0);
  const [eventName, setEventName] = useState('');

  const handleRowClick = (event: ScheduledEvent): void => {
    setRowId(event.id);
    setEventName(name);
  };

  return (
    <Row>
      <ScheduledEventsTableCard onRowClick={handleRowClick} />
      <ScheduledEventsRunHistoryTableCard rowId={rowId} eventName={eventName} />
    </Row>
  );
};

export default ScheduledEvents;
