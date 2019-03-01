import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { NavbarMinimise } from '../NavbarMinimise';

test('renders correctly', () => {
  const renderer = TestRenderer
    .create(<NavbarMinimise/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
