import React, { FunctionComponent } from 'react';

export interface ScheduledEventsTableRowProps {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  interval: number;
  repeat: string;
  interval_type: string;
  start_date: string;
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  const derivedTime = (): string => {
    const dt = new Date();
    dt.setTime(Date.parse(props.start_date));
    let hours = dt.getUTCHours();
    const AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = dt.getUTCMinutes();
    const finalTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + AmOrPm;

    return finalTime;
  };

  const derivedDate = (): string => {
    const day = new Date();
    day.setTime(Date.parse(props.start_date));
    const dd = String(day.getDate()).padStart(2, '0');
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const yyyy = day.getFullYear();
    const newDate = dd + '-' + mm + '-' + yyyy;

    return newDate;
  };

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
        {derivedDate()} at {derivedTime()}
      </td>
      <td>{props.repeat ? 'Every ' + props.interval + ' ' + props.interval_type : 'None'}</td>
    </tr>
  );
};
