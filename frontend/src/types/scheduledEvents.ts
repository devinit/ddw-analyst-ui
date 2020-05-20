import { Map } from 'immutable';

export interface ScheduledEvent {
  id: number;
  name: string;
  description: string | null;
  enabled: boolean;
  interval: string | null;
  actions: string;
}

export type ScheduledEventMap = Map<keyof ScheduledEvent, ScheduledEvent[keyof ScheduledEvent]>;
