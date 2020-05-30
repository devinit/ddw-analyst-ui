import { ScheduledEventsTableRowProps } from '../ScheduledEventsTableRow';

export const deriveTimeFromStartDate = (props: ScheduledEventsTableRowProps): string => {
  const dt = new Date();
  dt.setTime(Date.parse(props.start_date));
  let hours = dt.getUTCHours();
  const AmOrPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = dt.getUTCMinutes();
  const finalTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + AmOrPm;

  return finalTime;
};

export const deriveDateFromStartDate = (props: ScheduledEventsTableRowProps): string => {
  const day = new Date();
  day.setTime(Date.parse(props.start_date));
  const dd = String(day.getDate()).padStart(2, '0');
  const mm = String(day.getMonth() + 1).padStart(2, '0');
  const yyyy = day.getFullYear();
  const newDate = dd + '-' + mm + '-' + yyyy;

  return newDate;
};
