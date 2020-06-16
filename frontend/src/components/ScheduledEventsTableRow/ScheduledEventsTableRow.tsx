import moment from 'moment';
import React, { FunctionComponent, useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ScheduledEventContext } from '../../pages/ScheduledEvents';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { convertIntervalType, createRunInstance } from './utils';

export interface ScheduledEventsTableRowProps {
  id: number;
  event: ScheduledEvent;
  classNames?: string;
}

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  const { setActiveEvent } = useContext(ScheduledEventContext);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);

  const onRunNow = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();
    setIsCreatingInstance(true);
    createRunInstance(props.event.id, {
      start_at: moment(), // eslint-disable-line @typescript-eslint/camelcase
      status: 'p',
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          setIsCreatingInstance(false);
        } else {
          console.log(JSON.stringify(response));
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        setIsCreatingInstance(false);
      });
  };
  const onRowClick = (): void => {
    if (setActiveEvent) setActiveEvent(props.event);
  };

  return (
    <tr onClick={onRowClick} className={props.classNames}>
      <td className="text-center">{props.id}</td>
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
        <Button variant="outline-danger" size="sm" onClick={onRunNow} disabled={isCreatingInstance}>
          {isCreatingInstance ? 'Creating instance...' : 'Run Now'}
        </Button>
      </td>
    </tr>
  );
};
