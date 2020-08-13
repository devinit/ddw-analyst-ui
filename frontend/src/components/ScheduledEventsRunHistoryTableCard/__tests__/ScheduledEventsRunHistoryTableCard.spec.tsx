import React from 'react';
import renderer from 'react-test-renderer';
import { cleanup } from '@testing-library/react';
import { ScheduledEventsRunHistoryTableCard } from '../ScheduledEventsRunHistoryTableCard';

afterEach(cleanup);

it('should take a snapshot', () => {
  const tree = renderer.create(<ScheduledEventsRunHistoryTableCard />).toJSON();
  expect(tree).toMatchSnapshot();
});
