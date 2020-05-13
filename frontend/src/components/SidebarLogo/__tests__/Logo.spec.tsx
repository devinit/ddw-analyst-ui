/**
 * @jest-environment jsdom
 */
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router';
import * as TestRenderer from 'react-test-renderer';
import { Logo } from '../SidebarLogo';

test('renders the correct url with the default props', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <Logo url="/path" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the mini variation when specified', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <Logo url="/link" variation="mini" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the normal variation when specified', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <Logo url="/link" variation="normal" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});
