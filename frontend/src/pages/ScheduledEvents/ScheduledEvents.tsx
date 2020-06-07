import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsRunHistoryTableCard } from '../../components/ScheduledEventsRunHistoryTableCard';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';

type ScheduledEventsProps = RouteComponentProps;

const ScheduledEvents: FunctionComponent<ScheduledEventsProps> = () => {
  return (
    <Row>
      <ScheduledEventsTableCard />
      <ScheduledEventsRunHistoryTableCard />
    </Row>
  );
};

export default ScheduledEvents;
