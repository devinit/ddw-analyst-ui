import * as React from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventsTable } from '../ScheduledEventsTable/ScheduledEventsTable';
import { api, localForageKeys } from '../../utils';
import * as localForage from 'localforage';

export const ScheduledEventsTableCard = () => {
  const [scheduledEvents, setScheduledEvents] = React.useState({ data: [] });
  const basePath = api.routes.VIEW_SCHEDULED_EVENTS;
  React.useEffect(() => {
    const fetchData = async () => {
      const token = await localForage.getItem<string>(localForageKeys.API_KEY);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      };
      const result = await axios(`${basePath}`, { headers });
      setScheduledEvents({ data: result.data });
    };
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <Dimmer inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card>
        <Card.Header className="card-header-rose card-header-icon">
          <Card.Header className="card-icon">
            <i className="material-icons">schedule</i>
          </Card.Header>
          <h4 className="card-title">Scheduled Events</h4>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsTable events={scheduledEvents} />
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
