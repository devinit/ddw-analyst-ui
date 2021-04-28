import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SortableItem } from '../SortableItem';

describe('SortableItem', () => {
  test('renders correctly with the required props', () => {
    const renderer = TestRenderer.create(<SortableItem id="test" />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders a count when provided', () => {
    const renderer = TestRenderer.create(<SortableItem id="test" count={3} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
