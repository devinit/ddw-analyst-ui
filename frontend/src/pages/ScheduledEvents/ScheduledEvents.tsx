import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';

type ScheduledEventsProps = RouteComponentProps;

const ScheduledEvents: React.FC<ScheduledEventsProps> = (props) => {
  console.log(props);

  return (
    <Row>
      <Col lg={7}>
        <Dimmer inverted>
          <Loader content="Loading" />
        </Dimmer>
        <ScheduledEventsTableCard />
      </Col>
    </Row>
  );
};

export default ScheduledEvents;
