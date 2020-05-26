import * as React from 'react';

export interface ScheduledEventsTableRowProps {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  interval: number;
  repeat: string;
  interval_type: string;
}

export const ScheduledEventsTableRow: React.SFC<ScheduledEventsTableRowProps> = (props) => {
  return (
    <tr>
      <td className="text-center">{props.id}</td>
      <td>{props.name}</td>
      <td>{props.description}</td>
      <td>
        <div className="togglebutton">
          <label className="enabled">
            <input type="checkbox" defaultChecked={props.enabled} />
            <span className="toggle"></span>
          </label>
        </div>
      </td>
      <td>
        {props.repeat} {props.interval}
        {props.interval_type}
      </td>
    </tr>
  );
};
