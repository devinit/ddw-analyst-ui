import React, { FunctionComponent, useState, createContext } from 'react';
import { Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ScheduledEventsRunHistoryTableCard } from '../../components/ScheduledEventsRunHistoryTableCard';
import { ScheduledEventsTableCard } from '../../components/ScheduledEventsTableCard';
import { ScheduledEvent } from '../../types/scheduledEvents';

type ScheduledEventsProps = RouteComponentProps;
interface ScheduledEventContext {
  activeEvent?: ScheduledEvent;
  setActiveEvent?: (event: ScheduledEvent) => void;
}

export const ScheduledEventContext = createContext<ScheduledEventContext>({});

const ScheduledEvents: FunctionComponent<ScheduledEventsProps> = () => {
  const [activeEvent, setActiveEvent] = useState<ScheduledEvent | undefined>(undefined);

  const onSetActiveEvent = (event: ScheduledEvent): void => setActiveEvent(event);

  return (
    <Row>
      <ScheduledEventContext.Provider value={{ setActiveEvent: onSetActiveEvent, activeEvent }}>
        <ScheduledEventsTableCard />
        <ScheduledEventsRunHistoryTableCard event={activeEvent} />
      </ScheduledEventContext.Provider>
    </Row>
  );
};

export default ScheduledEvents;
