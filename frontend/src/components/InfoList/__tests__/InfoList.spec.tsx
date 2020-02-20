/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { fireEvent, render, waitForElement } from '@testing-library/react';
import { InfoList, InfoListItems, InfoMap } from '../InfoList';
import { List, Map } from 'immutable';

let list: InfoListItems;

beforeEach(() => {
  list = List([ Map({ caption: 'Item 1', info: 'My First Item' }) as InfoMap ]);
});

test('renders correctly with the default props', () => {
  const { container } = render(<InfoList list={ list }/>);

  expect(container).toMatchSnapshot();
});

test('renders all list items', async () => {
  list = list.push(Map({ caption: 'Item 2', info: 'My Second Item' }) as InfoMap);
  expect(list.count()).toEqual(2);
  const { container } = render(<InfoList list={ list }/>);

  expect(container).toMatchSnapshot();
});

test('updates when the list changes', () => {
  const { container, rerender } = render(<InfoList list={ list }/>);

  expect(container).toMatchSnapshot();

  list = list.push(Map({ caption: 'Item 2', info: 'My Second Item' }) as InfoMap);
  rerender(<InfoList list={ list }/>);

  expect(container).toMatchSnapshot();
});

xtest('renders the info on hover', async () => {
  const { getByTestId } = render(<InfoList list={ list }/>);

  fireEvent.mouseEnter(getByTestId('info-trigger'));
  const popOver = await waitForElement(() => getByTestId('info-list-info'));

  expect(popOver).toMatchSnapshot();
});

test('does not render the info trigger when no info is provided', async () => {
  list = list.set(0, Map({ caption: 'Item 1', info: '' }) as InfoMap);
  const { container } = render(<InfoList list={ list }/>);

  expect(container).toMatchSnapshot();
});
