/**
 * @jest-environment jsdom
 */
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router';
import * as TestRenderer from 'react-test-renderer';
import { Logo, SidebarLogo } from '../SidebarLogo';

test('renders correctly with the default props', () => {
  const renderer = TestRenderer
    .create(<SidebarLogo/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders Logo components', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLogo><Logo url="/link"/></SidebarLogo>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders only Logo components', () => {
  const renderer = TestRenderer
    .create(<SidebarLogo><div>Awesome</div></SidebarLogo>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
