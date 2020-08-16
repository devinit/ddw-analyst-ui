/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { ScheduledEventsTableCard } from '../ScheduledEventsTableCard';

describe('<ScheduledEventsTableCard', () => {
  afterEach(cleanup);
  const { container } = render(<ScheduledEventsTableCard />);
  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });
});
