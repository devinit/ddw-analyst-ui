import { List } from 'immutable';
import classNames from 'classnames';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventMap } from '../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';

interface ScheduledEventsTableProps {
  scheduledEvents: List<ScheduledEventMap>;
  activeScheduledEvent?: ScheduledEventMap;
  onRowClick: (scheduledEvent: ScheduledEventMap) => void;
}

export class ScheduledEventsTable extends React.Component<ScheduledEventsTableProps> {
  render() {
    return (
      <Table responsive table-striped className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
            <th>Interval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows(this.props.scheduledEvents, this.props.activeScheduledEvent)}
        </tbody>
      </Table>
    );
  }
  private renderRows(
    scheduledEvents: List<ScheduledEventMap>,
    activeScheduledEvent?: ScheduledEventMap,
  ) {
    if (scheduledEvents && scheduledEvents.size && activeScheduledEvent) {
      return scheduledEvents.map((scheduledEvent, index) => (
        <ScheduledEventsTableRow
          key={index}
          classNames={classNames({
            'table-danger': activeScheduledEvent.get('id') === scheduledEvent.get('id'),
          })}
          onClick={() => this.props.onRowClick(scheduledEvent)}
          id={scheduledEvent.get('id') as number}
          name={scheduledEvent.get('name') as string}
          description={scheduledEvent.get('description') as string}
          enabled={scheduledEvent.get('enabled') as boolean}
          interval={scheduledEvent.get('interval') as string}
          actions={scheduledEvent.get('actions') as string}
        />
      ));
    }

    return null;
  }
}
