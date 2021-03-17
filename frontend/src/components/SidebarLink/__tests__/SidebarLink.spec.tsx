/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router';
import * as TestRenderer from 'react-test-renderer';
import { SidebarLink } from '../SidebarLink';

test('renders the correct link with the default props', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders root links correctly', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" root />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders single links correctly', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" single />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('does not render with the data-toggle when configured as single', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" root single />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with a caret when specified', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" caret />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders root links with a label when specified', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink root to="link" textNormal="Label" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders non-root links with both labels', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" textNormal="Label" textMini="L" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with an icon when specified', () => {
  const renderer = TestRenderer.create(
    <Router history={createBrowserHistory()}>
      <SidebarLink to="link" icon="home" />
    </Router>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('calls the onClick function only when one is specified', () => {
  const onClickProp = jest.fn();
  const history = createBrowserHistory();
  history.push = jest.fn();
  const renderer = TestRenderer.create(
    <Router history={history}>
      <SidebarLink to="link" icon="home" onClick={onClickProp} />
    </Router>,
  );
  const instance = renderer.root;

  if (instance) {
    (instance.children[0] as TestRenderer.ReactTestInstance).props.onClick(
      new CustomEvent('click'),
    );
    expect(onClickProp).toBeCalledTimes(1);
  }
});

test('navigates to the link when one is specified', () => {
  const history = createBrowserHistory();
  history.push = jest.fn();
  const testID = 'sidebar-link';
  render(
    <Router history={history}>
      <SidebarLink to="link" icon="home" data-testid={testID} />
    </Router>,
  );
  fireEvent.click(screen.getByTestId(testID));

  expect(history.push).toBeCalledWith('link');
});

test('does not navigate when a # link is passed', () => {
  const history = createBrowserHistory();
  history.push = jest.fn();
  const testID = 'sidebar-link';
  render(
    <Router history={history}>
      <SidebarLink to="#link" icon="home" data-testid={testID} />
    </Router>,
  );
  fireEvent.click(screen.getByTestId(testID));

  expect(history.push).not.toBeCalled();
});
