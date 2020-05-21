import * as React from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventsTable } from '../ScheduledEventsTable/ScheduledEventsTable';

export const ScheduledEventsTableCard = () => {
  return (
    <React.Fragment>
      <Dimmer inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card>
        <Card.Header className="card-header-rose card-header-icon">
          <Card.Title>Scheduled Events</Card.Title>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsTable />
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
