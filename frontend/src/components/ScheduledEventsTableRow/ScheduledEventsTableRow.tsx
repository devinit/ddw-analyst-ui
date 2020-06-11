import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { convertIntervalType } from './utils';

export interface ScheduledEventsTableRowProps {
  event: ScheduledEvent;
  onClick?: () => void;
  classNames?: string;
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  return (
    <tr onClick={props.onClick} className={props.classNames}>
      <td className="text-center">{props.event.id}</td>
      <td>{props.event.name}</td>
      <td>{props.event.description}</td>
      <td>
        <div className="togglebutton">
          <label className="enabled">
            <input type="checkbox" defaultChecked={props.event.enabled} disabled />
            <span className="toggle"></span>
          </label>
        </div>
      </td>
      <td>
        {moment(props.event.start_date).format('LL')} at{' '}
        {moment.utc(props.event.start_date).format('LT')}
      </td>
      <td>
        {props.event.repeat && props.event.interval && props.event.interval_type
          ? `Every ${props.event.interval} ${convertIntervalType(props.event.interval_type)}`
          : 'None'}
      </td>
    </tr>
  );
};
