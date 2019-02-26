import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { ConditionalRender } from '../ConditionalRender';

test('renders null when the condition evaluates to false', () => {
  const renderer = TestRenderer
    .create(<ConditionalRender render={ false }>My Child</ConditionalRender>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the children when the condition evaluates to true', () => {
  const renderer = TestRenderer
    .create(<ConditionalRender render={ true }>My Child</ConditionalRender>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
