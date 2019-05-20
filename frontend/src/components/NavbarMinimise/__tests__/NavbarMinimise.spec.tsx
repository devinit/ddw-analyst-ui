/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { NavbarMinimise } from '../NavbarMinimise';

afterEach(cleanup);

test('renders correctly', () => {
  const renderer = TestRenderer
    .create(<NavbarMinimise/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('toggles the sidebar-mini', () => {
  const { add, remove } = document.body.classList;
  document.body.classList.add = jest.fn(add);
  document.body.classList.remove = jest.fn(remove);
  const { getByTestId } = render(<NavbarMinimise/>);
  const button = getByTestId('navbar-minimise-button');

  fireEvent.click(button);
  expect(document.body.classList.add).toHaveBeenCalled();
  expect(document.body.classList.remove).not.toHaveBeenCalled();

  fireEvent.click(button);
  expect(document.body.classList.remove).toHaveBeenCalled();
  expect(document.body.classList.add).toHaveBeenCalledTimes(1);
});
