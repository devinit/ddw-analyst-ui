import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';

export const ScheduledEventsRunHistoryTableCard: FunctionComponent = () => {
  return (
    <React.Fragment>
      <Dimmer inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card className="col-md-12">
        <Card.Header className="card-header-rose card-header-icon">
          <h4 className="card-title">Update FTS Run History</h4>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsRunHistoryTable />
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
