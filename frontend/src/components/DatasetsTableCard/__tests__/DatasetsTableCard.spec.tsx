/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { DatasetsTableCard } from '../DatasetsTableCard';
import { DatasetMap } from '../../../types/datasets';
import { List, fromJS } from 'immutable';

const datasets: DatasetMap[] = [
  fromJS({
    title: 'Dataset 1',
    publication: 'My first dataset',
    releasedAt: new Date()
  }),
  fromJS({
    title: 'Dataset 2',
    publication: 'My second dataset',
    releasedAt: new Date()
  })
];
test('renders the default component correctly', () => {
  const renderer = TestRenderer
    .create(<DatasetsTableCard loading={ false } datasets={ List(datasets) }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
