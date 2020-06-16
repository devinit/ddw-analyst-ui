import classNames from 'classnames';
import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { convertStatus, getStatusClasses } from './utils';

interface ScheduledEventsRunHistoryTableRowProps {
  history: ScheduledEventRunHistory;
}

export const ScheduledEventsRunHistoryTableRow: FunctionComponent<ScheduledEventsRunHistoryTableRowProps> = (
  props,
) => {
  const badgeClass = getStatusClasses(props.history.status);

  return (
    <tr>
      <td>
        <span className={classNames('badge', badgeClass)}>
          {convertStatus(props.history.status)}
        </span>
      </td>
      <td>{moment.utc(props.history.start_at).format('LLL')}</td>
      <td>{props.history.ended_at ? moment.utc(props.history.ended_at).format('LLL') : 'None'}</td>
    </tr>
  );
};
