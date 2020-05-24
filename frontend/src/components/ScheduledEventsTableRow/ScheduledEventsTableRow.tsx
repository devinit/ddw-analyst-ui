import * as React from 'react';

export interface ScheduledEventsTableRowProps {
  classNames?: string;
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  interval: string;
  actions: string;
}

export const ScheduledEventsTableRow: React.SFC<ScheduledEventsTableRowProps> = (props) => {
  return (
    <tr>
      <td className={props.classNames}>{props.id}</td>
      <td>{props.name}</td>
      <td>{props.description}</td>
      <td>{props.enabled}</td>
      <td>{props.interval}</td>
      <td>{props.actions}</td>
    </tr>
  );
};
