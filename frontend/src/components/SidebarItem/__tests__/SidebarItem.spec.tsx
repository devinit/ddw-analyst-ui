/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SidebarItem } from '../SidebarItem';
import { SidebarLink } from '../../SidebarLink';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';

test('renders correctly with the default props', () => {
  const renderer = TestRenderer
    .create(<SidebarItem/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with the class active when configured as active', () => {
  const renderer = TestRenderer
    .create(<SidebarItem active/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('render a root sidebar link', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarItem>
          <SidebarLink to="" root/>
        </SidebarItem>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders non-root sidebar links', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarItem>
          <SidebarLink to="" root/>
          <SidebarLink to=""/>
        </SidebarItem>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders only one root sidebar link', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarItem>
          <SidebarLink to="" root/>
          <SidebarLink to="" root/>
        </SidebarItem>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders other sidebar items', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarItem>
          <SidebarLink to="" root/>
          <SidebarItem/>
        </SidebarItem>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
