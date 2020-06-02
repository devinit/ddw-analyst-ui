import { Map } from 'immutable';

export interface ScheduledEvent {
  id: number;
  name: string;
  description: string | null;
  enabled: boolean;
  interval: number;
  interval_type: string;
  repeat: string;
  start_date: string;
}

export type ScheduledEventMap = Map<keyof ScheduledEvent, ScheduledEvent[keyof ScheduledEvent]>;
