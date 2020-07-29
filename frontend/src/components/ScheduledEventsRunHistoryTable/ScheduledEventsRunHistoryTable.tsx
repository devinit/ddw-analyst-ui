import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { BasicModal } from '../BasicModal';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';

interface ScheduledEventRunHistoryTableProps {
  data: ScheduledEventRunHistory[];
}
export const ScheduledEventsRunHistoryTable: FunctionComponent<ScheduledEventRunHistoryTableProps> = (
  props,
) => {
  const [info, setInfo] = useState('');
  const onViewLogs = (logs: string): void => setInfo(logs);
  const onModalHide = () => setInfo('');
  const renderRows = (): ReactNode =>
    props.data
      ? props.data.map((history: ScheduledEventRunHistory, index: number) => (
          <ScheduledEventsRunHistoryTableRow
            key={index}
            history={history}
            onViewLogs={onViewLogs}
          />
        ))
      : null;

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>Status</th>
          <th>Started</th>
          <th>Ended</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
      <BasicModal show={!!info} onHide={onModalHide}>
        <p>{info}</p>
      </BasicModal>
    </Table>
  );
};
