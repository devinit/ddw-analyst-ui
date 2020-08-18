/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render, waitFor, act } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
import { ScheduledEventsRunHistoryTableCard } from '../ScheduledEventsRunHistoryTableCard';
import { AxiosResponse } from 'axios';
import localforage from 'localforage';

jest.mock('localforage');
const data = {
  results: [
    {
      scheduled_event: 1,
      start_at: new Date('2020-01-01').toISOString(),
      status: 'pending',
    },
  ],
  count: 1,
};

const axiosResponse: AxiosResponse = {
  data: data,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {},
};

jest.mock('axios', () => ({
  __esModule: true,
  get: jest.fn(() => Promise.resolve(axiosResponse)),
  default: jest.fn(() => Promise.resolve(axiosResponse)),
}));

describe('<ScheduledEventsRunHistoryTableCard', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localforage.setItem('localForageKeys.API_KEY', '0695904053');
  });
  const event = {
    id: 1,
    name: 'event 1',
    description: null,
    enabled: true,
    interval: 2,
    interval_type: 'secs',
    repeat: true,
    start_date: new Date('2020-01-01').toISOString(),
  };
  afterEach(cleanup);
  afterEach(() => jest.clearAllMocks());

  it('should match snapshot', async () => {
    await act(async () => {
      const { container } = render(<ScheduledEventsRunHistoryTableCard event={event} />);
      expect(container).toMatchSnapshot();
    });
  });

  it('should fetch data per page on page load', async () => {
    await act(async () => {
      const { getByText } = render(<ScheduledEventsRunHistoryTableCard event={event} />);
      await waitFor(() => expect(getByText('Showing 1 to 1 of 1')));
    });
  });
});
