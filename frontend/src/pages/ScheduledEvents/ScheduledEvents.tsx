import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';

type ScheduledEventsProps = RouteComponentProps;

const ScheduledEvents: FunctionComponent<ScheduledEventsProps> = () => {
  return (
    <Row>
      <Col lg={7}>
        <ScheduledEventsTableCard />
      </Col>
    </Row>
  );
};

export default ScheduledEvents;
