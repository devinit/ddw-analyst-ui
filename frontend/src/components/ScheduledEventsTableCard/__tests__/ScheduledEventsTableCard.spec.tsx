/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { ScheduledEventsTableCard } from '../ScheduledEventsTableCard';
import localforage from 'localforage';

jest.mock('localforage');

describe('<ScheduledEventsTableCard', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localforage.setItem('localForageKeys.API_KEY', '0706079594');
  });
  afterEach(cleanup);

  it('should match snapshot', () => {
    const { container } = render(<ScheduledEventsTableCard />);
    expect(container).toMatchSnapshot();
  });
});
