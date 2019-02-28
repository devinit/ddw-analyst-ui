import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { LoginForm } from '../LoginForm';

test('renders the correctly with the default props', () => {
  const renderer = TestRenderer
    .create(<LoginForm/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders a card with the class card-hidden when showForm is set to false', () => {
  const renderer = TestRenderer
    .create(<LoginForm showForm={ false }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders an alert', () => {
  const renderer = TestRenderer
    .create(<LoginForm alert="This is an alert message!"/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
