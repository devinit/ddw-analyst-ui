import classNames from 'classnames';
import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { convertStatus, getStatusClasses } from './utils';

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
      <td>{props.started ? moment.utc(props.started).format('LLL') : 'None'}</td>
      <td>{props.ended ? moment.utc(props.ended).format('LLL') : 'None'}</td>
    </tr>
  );
};
