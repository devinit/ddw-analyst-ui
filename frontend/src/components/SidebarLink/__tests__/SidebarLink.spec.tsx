/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SidebarLink } from '../SidebarLink';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';

test('renders the correct link with the default props', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link"/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders root links correctly', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" root/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders single links correctly', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" single/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('does not render with the data-toggle when configured as single', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" root single/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with a caret when specified', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" caret/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders root links with a label when specified', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink root to="link" textNormal="Label"/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders non-root links with both labels', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" textNormal="Label" textMini="L"/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with an icon when specified', () => {
  const renderer = TestRenderer
    .create(
      <Router history={ createBrowserHistory() }>
        <SidebarLink to="link" icon="home"/>
      </Router>
    )
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
