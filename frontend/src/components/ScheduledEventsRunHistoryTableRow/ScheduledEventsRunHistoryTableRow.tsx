import classNames from 'classnames';
import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { convertStatus, getStatusClasses } from './utils';

interface ScheduledEventsRunHistoryTableRowProps {
  history: ScheduledEventRunHistory;
  onViewLogs?: (info: string) => void;
}

export const ScheduledEventsRunHistoryTableRow: FunctionComponent<
  ScheduledEventsRunHistoryTableRowProps
> = ({ history, onViewLogs }) => {
  const badgeClass = getStatusClasses(history.status);
  const onClickInfo = () => {
    if (onViewLogs && history.logs) {
      onViewLogs(history.logs);
    }
  };

  return (
    <tr>
      <td>
        <span className={classNames('badge', badgeClass)}>{convertStatus(history.status)}</span>
      </td>
      <td>{moment.utc(history.start_at).format('LLL')}</td>
      <td data-testid="history-end-date">
        {history.ended_at ? moment.utc(history.ended_at).format('LLL') : ''}
      </td>
      <td>
        {history.logs && onViewLogs ? (
          <Button
            size="sm"
            variant="link"
            className="btn-danger"
            onClick={onClickInfo}
            data-testid="logs-button"
          >
            <i className="material-icons" data-testid="info-trigger">
              info
            </i>{' '}
            <span>Logs</span>
          </Button>
        ) : null}
      </td>
    </tr>
  );
};
