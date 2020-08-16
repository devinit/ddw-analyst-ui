/**
 * @jest-environment jsdom
 */
import { cleanup } from '@testing-library/react';
import React from 'react';
import renderer from 'react-test-renderer';
import { ScheduledEvent } from '../../../types/scheduledEvents';
import { ScheduledEventsTableRow } from '../ScheduledEventsTableRow';

describe('<ScheduledEventsTableRow', () => {
  afterEach(cleanup);
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
});
