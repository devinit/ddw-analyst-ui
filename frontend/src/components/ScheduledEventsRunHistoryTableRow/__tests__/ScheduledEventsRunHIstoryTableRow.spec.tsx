/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render, fireEvent } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
import { ScheduledEventRunHistory } from '../../../types/scheduledEvents';
import { ScheduledEventsRunHistoryTableRow } from '../ScheduledEventsRunHistoryTableRow';

describe('<ScheduledEventsRunHistoryTableRow', () => {
  const onViewLogs = jest.fn();
  const history: ScheduledEventRunHistory = {
    scheduled_event: 1,
    start_at: new Date('2020-01-01').toISOString(),
    status: 'pending',
    logs: 'set of logs',
  };
  afterEach(cleanup);
  const tablebody = document.createElement('tbody');

  const { container } = render(
    <ScheduledEventsRunHistoryTableRow history={history} onViewLogs={onViewLogs} />,
    {
      container: document.body.appendChild(tablebody),
    },
  );

  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });

  it('calls the onViewLogs function when logs button is clicked', () => {
    const { getByTestId } = render(
      <ScheduledEventsRunHistoryTableRow history={history} onViewLogs={onViewLogs} />,
      { container: document.body.appendChild(tablebody) },
    );
    fireEvent.click(getByTestId('logsbutton'));
    expect(onViewLogs).toHaveBeenCalledTimes(1);
  });
});
