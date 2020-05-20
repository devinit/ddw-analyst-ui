import * as React from 'react';

export interface ScheduledEventsTableRowProps {
  classNames?: string;
  onClick: () => void;
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  interval: string;
  actions: string;
}

export const ScheduledEventsTableRow: React.SFC<ScheduledEventsTableRowProps> = (props) => {
  return (
    <tr
      className={props.classNames}
      onClick={props.onClick}
      data-testid="scheduled-events-table-row"
    >
      <td>{props.id}</td>
      <td>{props.name}</td>
      <td>{props.description}</td>
      <td>{props.enabled}</td>
      <td>{props.interval}</td>
      <td>{props.interval}</td>
    </tr>
  );
};
