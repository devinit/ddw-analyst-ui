import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Table } from 'react-bootstrap';
import styled from 'styled-components';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { BasicModal } from '../BasicModal';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';

interface ScheduledEventRunHistoryTableProps {
  data: ScheduledEventRunHistory[];
}

const StyledContent = styled.p`
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
`;

export const ScheduledEventsRunHistoryTable: FunctionComponent<ScheduledEventRunHistoryTableProps> = (
  props,
) => {
  const [info, setInfo] = useState('');
  const onViewLogs = (logs: string): void => setInfo(logs);
  const onModalHide = () => setInfo('');
  const renderRows = (): ReactNode =>
    props.data.map((history: ScheduledEventRunHistory, index: number) => (
      <ScheduledEventsRunHistoryTableRow key={index} history={history} onViewLogs={onViewLogs} />
    ));

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
        <StyledContent>{info}</StyledContent>
      </BasicModal>
    </Table>
  );
};
