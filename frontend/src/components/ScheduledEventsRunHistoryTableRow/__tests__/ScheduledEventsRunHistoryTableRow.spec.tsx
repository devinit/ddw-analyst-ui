import React from 'react';
import renderer from 'react-test-renderer';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';
import { cleanup } from '@testing-library/react';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';

afterEach(cleanup);

const history: ScheduledEventRunHistory = {
  scheduled_event: 1,
  start_at: '',
  status: 'pending',
};

it('should take a snapshot', () => {
  const tree = renderer.create(<ScheduledEventsRunHistoryTableRow history={history} />).toJSON();
  expect(tree).toMatchSnapshot();
});
