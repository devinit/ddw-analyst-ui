import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';
export interface ScheduledEventTableProps {
  currentPage: number;
  pageLimit: number;
  events: ScheduledEvent[];
  onRowClick: (event: ScheduledEvent) => void;
}

export const ScheduledEventsTable: FunctionComponent<ScheduledEventTableProps> = (props) => {
  const [activeRow, setActiveRow] = useState(0);

  const handleClick = (event: ScheduledEvent): void => {
    if (event.id !== activeRow) {
      setActiveRow(event.id);
      props.onRowClick(event);
    }
  };

  const renderRows = (): ReactNode =>
    props.events.map((event: ScheduledEvent, index: number) => {
      return (
        <ScheduledEventsTableRow
          key={event.id}
          rowId={index + 1}
          event={event}
          onClick={handleClick}
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};
