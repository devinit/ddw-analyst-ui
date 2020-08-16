/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
import { ScheduledEvent } from '../../../types/scheduledEvents';
import { ScheduledEventsTable } from '../ScheduledEventsTable';

describe('<ScheduledEventsTable', () => {
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
  afterEach(cleanup);
  const { container } = render(
    <ScheduledEventsTable currentPage={1} pageLimit={5} events={events} />,
  );
  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });
});
