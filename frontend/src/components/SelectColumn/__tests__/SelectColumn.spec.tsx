import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SelectColumn } from '../SelectColumn';

test('renders correctly with the required props', () => {
  const renderer = TestRenderer.create(<SelectColumn id="test" />).toJSON();

  expect(renderer).toMatchSnapshot();
});
