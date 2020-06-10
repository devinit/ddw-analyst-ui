import moment from 'moment';
import React, { FunctionComponent, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { convertIntervalType, createRunInstance } from './utils';

export interface ScheduledEventsTableRowProps {
  rowId: number;
  event: ScheduledEvent;
  onClick: (id: number, name: string) => void;
  classNames?: string;
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  const [isCreatingInstance, setLoading] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();
    setLoading(true);
    createRunInstance(props.event.id, {
      start_at: moment(),
      status: 'p',
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          setLoading(false);
        } else {
          console.log(JSON.stringify(response));
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        setLoading(false);
      });
  };

  return (
    <tr
      onClick={(): void => props.onClick(props.event.id, props.event.name)}
      className={props.classNames}
    >
      <td className="text-center">{props.rowId}</td>
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
      <td>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleClick}
          disabled={isCreatingInstance}
        >
          {isCreatingInstance ? 'Creating instance...' : 'Run Now'}
        </Button>
      </td>
    </tr>
  );
};
