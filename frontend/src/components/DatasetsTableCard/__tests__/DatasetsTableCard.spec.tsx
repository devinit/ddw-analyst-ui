/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import { List, fromJS } from 'immutable';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { DatasetMap } from '../../../types/datasets';
import { DatasetsTableCard } from '../DatasetsTableCard';

const datasets: DatasetMap[] = [
  fromJS({
    id: '1',
    title: 'Dataset 1',
    publication: 'My first dataset',
    releasedAt: new Date()
  }),
  fromJS({
    id: '2',
    title: 'Dataset 2',
    publication: 'My second dataset',
    releasedAt: new Date()
  })
];

test('renders correctly with no datasets', () => {
  const { getByTestId } = render(<DatasetsTableCard loading={ false }/>);

  expect(getByTestId('datasets-no-data')).toHaveTextContent('No results found');
});

test('renders the datasets correctly', () => {
  const renderer = TestRenderer
    .create(<DatasetsTableCard loading={ false } datasets={ List(datasets) }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('clicking the details button on a row opens the modal', () => {
  const { getByTestId, queryByTestId } = render(<DatasetsTableCard loading={ false } datasets={ List(datasets) }/>);

  expect(queryByTestId('details-modal-1')).toBeFalsy();

  fireEvent.click(getByTestId('details-button-1'));

  expect(queryByTestId('details-modal-1')).toBeTruthy();
  expect(getByTestId('details-modal-1').parentElement).toHaveClass('show');
});
