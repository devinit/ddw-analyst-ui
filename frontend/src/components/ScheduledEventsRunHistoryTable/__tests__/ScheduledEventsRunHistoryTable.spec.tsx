import { cleanup } from '@testing-library/react';
import React from 'react';
import renderer from 'react-test-renderer';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';

afterEach(cleanup);

const historyData: ScheduledEventRunHistory[] = [
  {
    scheduled_event: 1,
    status: 'pending',
    start_at: '',
  },
];

it('should take a snapshot', () => {
  const tree = renderer.create(<ScheduledEventsRunHistoryTable data={historyData} />).toJSON();
  expect(tree).toMatchSnapshot();
});
