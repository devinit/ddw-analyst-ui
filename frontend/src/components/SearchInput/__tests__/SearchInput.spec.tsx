/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SearchInput } from '../SearchInput';
import { fireEvent, render } from '@testing-library/react';

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(
    <SearchInput testid="search-input" placeholder="Search ..." />,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('enter button triggers onChange function', () => {
  const onChange = jest.fn();
  const { getByTestId } = render(
    <SearchInput testid="search-input" placeholder="Search ..." onSearch={onChange} />,
  );
  fireEvent.keyDown(getByTestId('search-input'), { key: 'Enter', code: 13, charCode: 13 });

  expect(onChange).toHaveBeenCalled();
});
