import React, { FunctionComponent } from 'react';

interface ScheduledEventsHistoryRowProps {
  classNames?: string;
  status: string;
  start: string;
  end: string;
}
export const ScheduledEventsRunHistoryTableRow: FunctionComponent<ScheduledEventsHistoryRowProps> = (
  props,
) => {
  return (
    <tr>
      <td>
        <span className={props.classNames}>{props.status}</span>
      </td>
      <td>{props.start}</td>
      <td>{props.end}</td>
    </tr>
  );
};
