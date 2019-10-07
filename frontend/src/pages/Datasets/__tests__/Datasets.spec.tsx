/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Datasets } from '../Datasets';

test('renders the default DataSet page correctly', () => {
  const renderer = TestRenderer
    .create(<Datasets/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});
