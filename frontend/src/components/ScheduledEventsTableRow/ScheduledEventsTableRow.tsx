import * as React from 'react';

export interface ScheduledEventsTableRowProps {
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
      <td className="text-center">{props.id}</td>
      <td>{props.name}</td>
      <td>{props.description}</td>
      <td>
        <div className="togglebutton">
          <label className="disabled">
            <input type="checkbox" defaultChecked />
            <span className="toggle"></span>
          </label>
        </div>
      </td>
      <td>Everyday at {props.interval}AM</td>
      <td className="td-actions text-right">
        <button type="button" className="btn btn-info" data-original-title>
          <i className="material-icons">play_circle_filled</i>
          Run Now
          <div className="ripple-container"></div>
        </button>
      </td>
    </tr>
  );
};
