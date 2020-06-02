import React, { FunctionComponent } from 'react';
import { deriveTimeFromStartDate, deriveDateFromStartDate } from '.';

export interface ScheduledEventsTableRowProps {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  interval: number;
  repeat: string;
  interval_type: string;
  start_date: string;
  onClick?: () => void;
  classNames?: string;
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  return (
    <tr onClick={props.onClick} className={props.classNames}>
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
        {deriveDateFromStartDate(props)} at {deriveTimeFromStartDate(props)}
      </td>
      <td>{props.repeat ? 'Every ' + props.interval + ' ' + props.interval_type : 'None'}</td>
    </tr>
  );
};
