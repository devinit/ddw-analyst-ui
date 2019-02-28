/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { cleanup, render, waitForElement } from 'react-testing-library';
import { Login } from '../Login';
import 'jest-dom/extend-expect';

afterEach(cleanup);

test('renders the loading indicator while loading', () => {
  const RouterContainer = withRouter(Login);
  const renderer = TestRenderer
    .create(<MemoryRouter><RouterContainer/></MemoryRouter>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the login form when loading is false', async () => {
  const RouterContainer = withRouter(Login);
  const { getByTestId } = render(<MemoryRouter><RouterContainer/></MemoryRouter>);
  const Form = await waitForElement(() => getByTestId('login-form'));

  expect(Form).toMatchSnapshot();
});
