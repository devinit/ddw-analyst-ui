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

  it('should match snapshot', () => {
    const { container } = render(<ScheduledEventsTableCard />);
    expect(container).toMatchSnapshot();
  });
});
