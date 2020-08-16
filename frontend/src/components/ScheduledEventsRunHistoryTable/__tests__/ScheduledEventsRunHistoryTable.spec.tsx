/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';

describe('<ScheduledEventsRunHistoryTable', () => {
  const data: ScheduledEventRunHistory[] = [
    {
      scheduled_event: 1,
      start_at: '',
      status: 'pending',
    },
  ];
  afterEach(cleanup);
  const { container } = render(<ScheduledEventsRunHistoryTable data={data} />);
  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });
});
