import React, { FunctionComponent } from 'react';
import moment from 'moment';

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
        {moment(props.start_date).format('LL')} at {moment.utc(props.start_date).format('LT')}
      </td>
      <td>
        {props.repeat && props.interval && props.interval_type
          ? `Every ${props.interval} ${props.interval_type}`
          : 'None'}
      </td>
    </tr>
  );
};
