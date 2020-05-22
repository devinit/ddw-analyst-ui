import { List, Map, fromJS } from 'immutable';
import { Action, Reducer } from 'redux';
import { ScheduledEvent, ScheduledEventMap } from '../types/scheduledEvents';

export interface ScheduledEventsAction extends Action {
  scheduledEvents?: ScheduledEvent[];
  activeScheduledEvent?: ScheduledEventMap;
  count: number;
  activeScheduleEventIndex?: number;
  payload: Partial<{
    limit: number;
    offset: number;
    link: string;
    search: string;
    id: number | string;
  }>;
  loading?: boolean;
}
interface State {
  loading: boolean;
  scheduledEvents: List<ScheduledEventMap>;
  activeScheduledEvent?: ScheduledEventMap;
  count: number;
  activeOperationId: number;
}
export type ScheduledEventsState = Map<keyof State, State[keyof State]>;

const prefix = 'scheduledEvents';
export const FETCH_SCHEDULED_EVENTS = `${prefix}.FETCH`;
export const FETCH_SCHEDULED_EVENTS_SUCCESSFUL = `${prefix}.FETCH_SUCCESSFUL`;
export const FETCH_SCHEDULED_EVENTS_FAILED = `${prefix}.FETCH_FAILED`;
export const SET_ACTIVE_SCHEDULED_EVENT = `${prefix}.SET_ACTIVE_SCHEDULED_EVENT`;
export const FETCH_SCHEDULED_EVENT = `${prefix}.FETCH_SCHEDULED_EVENT`;
export const FETCH_SCHEDULED_EVENT_FAILED = `${prefix}.FETCH_FAILED`;
export const DELETE_SCHEDULED_EVENT = `${prefix}.DELETE_SCHEDULED_EVENT`;
export const DELETE_SCHEDULED_EVENT_SUCCESSFUL = `${prefix}.DELETE_SCHEDULED_EVENT_SUCCESSFUL`;
export const DELETE_SCHEDULED_EVENT_FAILED = `${prefix}.DELETE_SCHEDULED_EVENT_FAILED`;

export const defaultState: ScheduledEventsState = fromJS({
  loading: false,
  scheduledEvents: [],
  activeScheduledEventId: 1,
  limit: 10,
  offset: 0,
});

export const scheduledEventsReducer: Reducer<ScheduledEventsState, ScheduledEventsAction> = (
  state = defaultState,
  action,
) => {
  if (action.type === FETCH_SCHEDULED_EVENTS || action.type === FETCH_SCHEDULED_EVENT) {
    return state.set('loading', true);
  }
  if (action.type === FETCH_SCHEDULED_EVENTS_SUCCESSFUL && action.scheduledEvents) {
    return state.withMutations((map) =>
      map
        .set('loading', false)
        .set('scheduledEvents', fromJS(action.scheduledEvents))
        .set('count', action.count),
    );
  }
  if (
    action.type === FETCH_SCHEDULED_EVENTS_FAILED ||
    action.type === FETCH_SCHEDULED_EVENT_FAILED
  ) {
    return state.set('loading', false);
  }
  if (action.type === SET_ACTIVE_SCHEDULED_EVENT) {
    return state.set('activeScheduledEvent', action.activeScheduledEvent).set('loading', false);
  }

  return state;
};
