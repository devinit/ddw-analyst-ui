import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { AdminLayoutContent } from '../AdminLayoutContent';

test('renders the specified children', () => {
  const renderer = TestRenderer
    .create(<AdminLayoutContent>My Content</AdminLayoutContent>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders no content when no children are added', () => {
  const renderer = TestRenderer
    .create(<AdminLayoutContent/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
