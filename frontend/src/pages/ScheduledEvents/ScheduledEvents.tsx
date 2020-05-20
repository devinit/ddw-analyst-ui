import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';

type ScheduledEventsProps = RouteComponentProps;

class ScheduledEvents extends React.Component<ScheduledEventsProps> {
  render() {
    return (
      <Row>
        <Col lg={7}>
          <ScheduledEventsTableCard limit={4} offset={1} count={1} />
        </Col>
      </Row>
    );
  }
}
export default ScheduledEvents;
