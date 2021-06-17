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
    status: 'p',
    logs: 'set of logs',
  };
  afterEach(cleanup);
  const tablebody = document.createElement('tbody');

  it('should match snapshot', () => {
    const { container } = render(
      <ScheduledEventsRunHistoryTableRow history={history} onViewLogs={onViewLogs} />,
      {
        container: document.body.appendChild(tablebody),
      },
    );
    expect(container).toMatchSnapshot();
  });

  it('displays logs if logs button is clicked', () => {
    const onClickInfo = jest.fn();
    const { getByTestId } = render(
      <ScheduledEventsRunHistoryTableRow history={history} onViewLogs={onViewLogs}>
        <button onClick={onClickInfo}></button>
      </ScheduledEventsRunHistoryTableRow>,
      { container: document.body.appendChild(tablebody) },
    );
    const button = getByTestId('logs-button') as HTMLElement;
    expect(button).toBeDefined();
    expect(button).not.toBeNull();
    if (button) fireEvent.click(button);
    expect(onViewLogs).toHaveBeenCalledTimes(1);
    expect(onViewLogs).toHaveBeenCalledWith(history.logs);
  });

  it('should not render logs button if onViewLogs is undefined', () => {
    const { queryByTestId } = render(<ScheduledEventsRunHistoryTableRow history={history} />, {
      container: document.body.appendChild(tablebody),
    });

    expect(queryByTestId('logs-button')).toBeFalsy();
  });

  it('should return formatted end date if ended_at is defined', () => {
    const history: ScheduledEventRunHistory = {
      scheduled_event: 1,
      start_at: new Date('2020-01-01').toISOString(),
      ended_at: new Date('2020-08-01').toISOString(),
      status: 'p',
      logs: 'set of logs',
    };
    const { getByTestId } = render(<ScheduledEventsRunHistoryTableRow history={history} />, {
      container: document.body.appendChild(tablebody),
    });

    expect(getByTestId('history-end-date')).toHaveTextContent('August 1, 2020 12:00 AM');
  });
});
