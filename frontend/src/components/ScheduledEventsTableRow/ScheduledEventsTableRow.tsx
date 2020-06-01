import React, { FunctionComponent, useState } from 'react';
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
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  const [activeRow, setActiveRow] = useState(0);
  const toggleActive = (i: number): void => {
    setActiveRow(i);
    if (activeRow === i) {
      setActiveRow(0);
    } else {
      setActiveRow(i);
    }
  };

  return (
    <tr
      onClick={(): void => toggleActive(props.id)}
      style={activeRow === props.id ? { background: '#fccac7' } : { background: '' }}
    >
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
