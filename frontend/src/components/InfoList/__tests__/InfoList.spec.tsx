/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { fireEvent, render, waitForElement } from 'react-testing-library';
import { InfoList, InfoListItems, InfoMap } from '../InfoList';
import { List, Map } from 'immutable';

let list: InfoListItems;

beforeEach(() => {
  list = List([ Map({ caption: 'Item 1', info: 'My First Item' }) as InfoMap ]);
});

test('renders correctly with the default props', () => {
  const { container } = render(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();
});

test('renders all list items', async () => {
  list = list.push(Map({ caption: 'Item 2', info: 'My Second Item' }) as InfoMap);
  expect(list.count()).toEqual(2);
  const { container } = render(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();
});

test('updates when the list changes', () => {
  const { container, rerender } = render(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();

  list = list.push(Map({ caption: 'Item 2', info: 'My Second Item' }) as InfoMap);
  rerender(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();
});

test('renders the info on hover', async () => {
  const { getByTestId } = render(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  fireEvent.mouseEnter(getByTestId('info-trigger'));
  const popOver = await waitForElement(() => getByTestId('info-list-info'));

  expect(popOver).toMatchSnapshot();
});

test('does not render the info trigger when no info is provided', async () => {
  list = list.set(0, Map({ caption: 'Item 1', info: '' }) as InfoMap);
  const { container } = render(<InfoList list={ list } limit={ 10 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();
});

test('renders the pagination when the list exceeds the page limit', async () => {
  for (let count = 1; count < 12; count++) {
    list = list.push(Map({ caption: `Item ${count + 1}`, info: `Item Number ${ count + 1}` }) as InfoMap);
  }
  const { container, getByTestId } = render(<InfoList list={ list } limit={ 5 } offset={ 0 }/>);

  expect(container).toMatchSnapshot();

  fireEvent.click(getByTestId('info-pagination-next'));
  expect(container).toMatchSnapshot();

  fireEvent.click(getByTestId('info-pagination-prev'));
  expect(container).toMatchSnapshot();

  fireEvent.click(getByTestId('info-pagination-last'));
  expect(container).toMatchSnapshot();

  fireEvent.click(getByTestId('info-pagination-first'));
  expect(container).toMatchSnapshot();
});
