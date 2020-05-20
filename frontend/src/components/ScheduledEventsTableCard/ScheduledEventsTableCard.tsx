import * as React from 'react';
import { Card } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { LinksMap } from '../../types/api';
import { ScheduledEventsTable } from '../ScheduledEventsTable/ScheduledEventsTable';

interface ComponentProps extends RouteComponentProps {
  loading: boolean;
  limit: number;
  offset: number;
  links?: LinksMap;
  count: number;
}
type ScheduledEventsTableCardProps = ComponentProps;

export class ScheduledEventsTableCard extends React.Component<
  ScheduledEventsTableCardProps,
  { searchQuery: string }
> {
  static defaultProps: Partial<ScheduledEventsTableCardProps> = {
    limit: 10,
    offset: 0,
  };
  state = { searchQuery: '' };

  render() {
    return (
      <React.Fragment>
        <Dimmer active={this.props.loading} inverted>
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
  }
}
