import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';
import { cleanup } from '@testing-library/react';
import { ScheduledEvent } from '../../../types/scheduledEvents';

const currentDate = new Date();

const event: ScheduledEvent = {
  id: 1,
  name: 'Common Reporting Standard',
  description: 'event1',
  enabled: true,
  interval: 1,
  interval_type: 'sec',
  repeat: true,
  start_date: currentDate.toISOString(),
};

afterEach(cleanup);

test('renders correctly with default props', () => {
  const renderer = TestRenderer.create(<ScheduledEventsTableRow id={1} event={event} />).toJSON();

  expect(renderer).toMatchSnapshot();
});
