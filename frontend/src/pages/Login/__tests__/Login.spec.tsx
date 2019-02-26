import * as React from 'react';
// import axios from 'axios';
import { MemoryRouter, withRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { cleanup, render, waitForElement } from 'react-testing-library';
import { Login } from '../Login';

afterEach(cleanup);
jest.mock('axios');

test('renders the loading indicator while loading', () => {
  const RouterContainer = withRouter(Login);
  const renderer = TestRenderer
    .create(<MemoryRouter><RouterContainer/></MemoryRouter>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

xtest('renders the login form when loading is false', async () => {
  const RouterContainer = withRouter(Login);
  const { getByTestId } = render(<MemoryRouter><RouterContainer/></MemoryRouter>);
  // const component = TestRenderer
  //   .create(<MemoryRouter><RouterContainer/></MemoryRouter>);

  // let renderer = component.toJSON();
  // expect(renderer).toMatchSnapshot();

  // const instance = component.getInstance();
  // if (renderer && instance) {
  //   instance.componentDidMount();
  //   renderer = component.toJSON();
  //   expect(renderer).toMatchSnapshot();
  // }
  // (axios.get as any).mockResolvedValueOnce({ data: { }})
  const Form = await waitForElement(() => getByTestId('login-form'));
  expect(Form).toMatchSnapshot();
});
