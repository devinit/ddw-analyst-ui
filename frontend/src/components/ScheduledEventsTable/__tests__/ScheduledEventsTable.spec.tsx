import React from 'react';
import renderer from 'react-test-renderer';
import { ScheduledEventsTable } from '../ScheduledEventsTable';
import { cleanup } from '@testing-library/react';
import { ScheduledEvent } from '../../../types/scheduledEvents';

afterEach(cleanup);

const events: ScheduledEvent[] = [
  {
    id: 1,
    name: 'event1',
    description: null,
    enabled: true,
    interval: 5,
    interval_type: 'secs',
    repeat: true,
    start_date: '',
  },
];

it('should take a snapshot', () => {
  const tree = renderer
    .create(<ScheduledEventsTable currentPage={1} pageLimit={5} events={events} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
