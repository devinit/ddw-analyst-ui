import * as React from 'react';

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

export const ScheduledEventsTableRow: React.SFC<ScheduledEventsTableRowProps> = (props) => {
  const convertDate = () => {
    const dt = new Date();
    dt.setTime(Date.parse(props.start_date));
    let hours = dt.getUTCHours();
    const AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = dt.getUTCMinutes();
    const finalTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + AmOrPm;

    return finalTime;
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
        Every {props.interval} {props.interval_type} at {convertDate()}
      </td>
    </tr>
  );
};
