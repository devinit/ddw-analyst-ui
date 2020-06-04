import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';
import { ScheduledEventsRunHistoryTableCard } from '../../components/ScheduledEventsRunHistoryTableCard';

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
