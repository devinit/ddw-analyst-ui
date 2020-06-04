import React, { FunctionComponent, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { Table } from 'react-bootstrap';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';
import { fetchRunHistory } from './utils';

export interface ScheduledEventTableProps {
  currentPage: number;
  pageLimit: number;
  events: Array<{}>;
}
export const ScheduledEventsTable: FunctionComponent<ScheduledEventTableProps> = (props) => {
  const offset = (props.currentPage - 1) * props.pageLimit;
  const [activeRow, setActiveRow] = useState(0);
  const [runHistory, setRunHistory] = useState({});

  const handleClick = (id: number) => (): void => {
    if (id !== activeRow) {
      setActiveRow(id);
      fetchRunHistory(id).then((result) => {
        console.log(runHistory);
        result.data && result.data.length ? setRunHistory(result.data) : null;
      });
    }
  };

  const renderRows = (): ReactNode =>
    props.events.map((event: ScheduledEvent, index: number) => {
      return (
        <ScheduledEventsTableRow
          key={index}
          id={offset + index + 1}
          name={event.name}
          description={event.description || ''}
          enabled={event.enabled}
          interval={event.interval}
          interval_type={event.interval_type}
          repeat={event.repeat}
          start_date={event.start_date}
          onClick={handleClick(offset + index + 1)}
          classNames={classNames({ 'table-danger': activeRow === offset + index + 1 })}
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
