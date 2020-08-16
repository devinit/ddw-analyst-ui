/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import { cleanup, render, act } from '@testing-library/react';
import ScheduledEvents from '../ScheduledEvents';
import localforage from 'localforage';
import { AxiosResponse } from 'axios';

jest.mock('localforage');

const testJson = {
  count: 1,
  next: null,
  previous: null,
  results: [],
};
const axiosResponse: AxiosResponse = {
  data: testJson,
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

describe('<ScheduledEvents', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localforage.setItem('localForageKeys.API_KEY', '0706079594');
  });
  afterEach(cleanup);

  const RouterContainer = withRouter(ScheduledEvents);

  it('should match snapshot', async () => {
    await act(async () => {
      const { container } = render(
        <MemoryRouter>
          <RouterContainer />
        </MemoryRouter>,
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('should render the Scheduled Events page lazily ', async () => {
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter>
          <React.Suspense fallback="test loading">
            <RouterContainer />
          </React.Suspense>
        </MemoryRouter>,
      );
      expect(getByText('Scheduled Events'));
    });
  });
});
