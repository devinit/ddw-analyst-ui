import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';
export interface ScheduledEventTableProps {
  currentPage: number;
  pageLimit: number;
  events: Array<{}>;
  onRowClick: (id: number, name: string) => void;
}
export const ScheduledEventsTable: FunctionComponent<ScheduledEventTableProps> = (props) => {
  const [activeRow, setActiveRow] = useState(0);

  const handleClick = (id: number, name: string) => (): void => {
    if (id !== activeRow) {
      setActiveRow(id);
      props.onRowClick(id, name);
    }
  };

  const renderRows = (): ReactNode =>
    props.events.map((event: ScheduledEvent) => {
      return (
        <ScheduledEventsTableRow
          key={event.id}
          id={event.id}
          name={event.name}
          description={event.description || ''}
          enabled={event.enabled}
          interval={event.interval}
          interval_type={event.interval_type}
          repeat={event.repeat}
          start_date={event.start_date}
          onClick={handleClick(event.id, event.name)}
          classNames={classNames({ 'table-danger': activeRow === event.id })}
        />
      );
    });

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th className="text-center">#</th>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Start Date</th>
          <th>Interval</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
