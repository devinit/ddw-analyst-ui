import classNames from 'classnames';
import React, { FunctionComponent, useContext } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventContext } from '../../pages/ScheduledEvents';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';
export interface ScheduledEventTableProps {
  currentPage: number;
  pageLimit: number;
  events: ScheduledEvent[];
}

export const ScheduledEventsTable: FunctionComponent<ScheduledEventTableProps> = (props) => {
  const { activeEvent } = useContext(ScheduledEventContext);

  const getRowNumber = (index: number): number => {
    return props.currentPage === 1 ? index + 1 : (props.currentPage - 1) * props.pageLimit + 1;
  };

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
      <tbody>
        {props.events.map((event: ScheduledEvent, index: number) => {
          return (
            <ScheduledEventsTableRow
              key={event.id}
              id={getRowNumber(index)}
              event={event}
              classNames={classNames({
                'table-danger': activeEvent && activeEvent.id === event.id,
              })}
            />
          );
        })}
      </tbody>
    </Table>
  );
};
