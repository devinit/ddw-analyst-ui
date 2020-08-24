/**
 * @jest-environment jsdom
 */
import { cleanup, render, fireEvent } from '@testing-library/react';
import React from 'react';
import renderer from 'react-test-renderer';
import { ScheduledEvent } from '../../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';

describe('<ScheduledEventsTableRow', () => {
  afterEach(cleanup);
  const tablebody = document.createElement('tbody');
  const event: ScheduledEvent = {
    id: 1,
    name: 'event1',
    description: null,
    enabled: true,
    interval: 2,
    start_date: '',
    interval_type: 'secs',
    repeat: true,
  };
  it('should take a snapshot', () => {
    const tree = renderer.create(<ScheduledEventsTableRow id={1} event={event} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('creates instance on button click', () => {
    const { getByTestId } = render(<ScheduledEventsTableRow id={1} event={event} />, {
      container: document.body.appendChild(tablebody),
    });
    const button = getByTestId('sche-events-table-btn');
    fireEvent.click(button);
    expect(button.innerHTML).toEqual('Creating instance...');
  });
});
