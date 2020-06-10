import React, { FunctionComponent, useState } from 'react';
import { Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsRunHistoryTableCard } from '../../components/ScheduledEventsRunHistoryTableCard';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';

type ScheduledEventsProps = RouteComponentProps;

const ScheduledEvents: FunctionComponent<ScheduledEventsProps> = () => {
  const [rowId, setRowId] = useState(0);
  const [eventName, setEventName] = useState('');

  const handleRunHistory = (id: number, name: string): void => {
    setRowId(id);
    setEventName(name);
  };

  return (
    <Row>
      <ScheduledEventsTableCard handleRunHistory={handleRunHistory} />
      <ScheduledEventsRunHistoryTableCard rowId={rowId} eventName={eventName} />
    </Row>
  );
};

export default ScheduledEvents;
