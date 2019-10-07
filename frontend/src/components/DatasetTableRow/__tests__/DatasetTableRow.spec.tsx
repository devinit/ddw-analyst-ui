/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { DatasetTableRow } from '../DatasetTableRow';
import { Dataset } from '../../../types/datasets';

const defaultDataset: Partial<Dataset> = {
  title: 'Dataset 1',
  publication: 'My first dataset',
  releasedAt: new Date().toDateString()
};

test('renders the default component correctly', () => {
  const renderer = TestRenderer
    .create(<DatasetTableRow onClick={ jest.fn() } dataset={ defaultDataset as Dataset }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
