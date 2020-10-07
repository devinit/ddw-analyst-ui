export interface ScheduledEvent {
  id: number;
  name: string;
  description: string | null;
  enabled: boolean;
  interval: number;
  interval_type: string;
  repeat: boolean;
  start_date: string;
}

export interface ScheduledEventRunHistory {
  scheduled_event: number;
  start_at: string;
  ended_at?: string;
  status: string;
  logs?: string;
}
