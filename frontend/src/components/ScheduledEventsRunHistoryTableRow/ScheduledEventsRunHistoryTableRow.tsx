import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { convertStatus, getStatusClasses } from './utils';
import moment from 'moment';

interface ScheduledEventsRunHistoryTableRowProps {
  status: string;
  started: string;
  ended: string;
}
export const ScheduledEventsRunHistoryTableRow: FunctionComponent<ScheduledEventsRunHistoryTableRowProps> = (
  props,
) => {
  const badgeClass = getStatusClasses(props.status);

  return (
    <tr>
      <td>
        <span className={classNames('badge', badgeClass)}>{convertStatus(props.status)}</span>
      </td>
      <td>{props.started}</td>
      <td>{props.ended}</td>
    </tr>
  );
};
