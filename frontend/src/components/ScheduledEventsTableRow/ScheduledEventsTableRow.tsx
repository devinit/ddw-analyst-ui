import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ScheduledEvent } from '../../types/scheduledEvents';
import { api, localForageKeys } from '../../utils';
import { convertIntervalType } from './utils';

export interface ScheduledEventsTableRowProps {
  event: ScheduledEvent;
  onClick: (id: number, name: string) => void;
  classNames?: string;
}

const BASEPATH = api.routes.VIEW_SCHEDULED_EVENTS;

const createRunInstance = async (scheduleId: number | undefined, data: any): Promise<any> => {
  const token = await localForage.getItem<string>(localForageKeys.API_KEY);

  return await axios.request({
    url: `${BASEPATH}${scheduleId}${api.routes.CREATE_SCHEDULED_INSTANCE}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    data,
  });
};

export const ScheduledEventsTableRow: FunctionComponent<ScheduledEventsTableRowProps> = (props) => {
  const [isLoading, setLoading] = useState(false);
  const [scheduleId, setScheduleId] = useState<number>();

  useEffect(() => {
    setScheduleId(props.event.id);
  }, []);

  const handleClick = () => {
    setLoading(true);
    createRunInstance(scheduleId, {
      start_at: moment(),
      status: 'p',
    }).then((response: AxiosResponse<string>) => {
      setLoading(false);
    });
  };

  return (
    <tr
      onClick={(): void => props.onClick(props.event.id, props.event.name)}
      className={props.classNames}
    >
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
      <td>
        <Button variant="danger" size="sm" onClick={handleClick} data-id={props.event.id}>
          {isLoading ? 'Loading…' : 'Run'}
        </Button>
      </td>
    </tr>
  );
};
