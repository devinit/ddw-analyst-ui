/**
 * @jest-environment jsdom
 */
import 'jest-dom/extend-expect';
import * as React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { cleanup, render, waitForElement } from 'react-testing-library';
import { Login, LoginActions } from '../Login';

let actions: LoginActions;
afterEach(cleanup);
beforeEach(() => {
  actions = {
    setUser: jest.fn(),
    setToken: jest.fn()
  };
});

test('renders the loading indicator while loading', () => {
  const RouterContainer = withRouter(Login);
  const renderer = TestRenderer
    .create(<MemoryRouter><RouterContainer actions={ actions }/></MemoryRouter>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the login form when loading is false', async () => {
  const RouterContainer = withRouter(Login);
  const { getByTestId } = render(<MemoryRouter><RouterContainer actions={ actions }/></MemoryRouter>);
  const Form = await waitForElement(() => getByTestId('login-form'));

  expect(Form).toMatchSnapshot();
});
