/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
// import { render } from '@testing-library/react';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { DatasetForm } from '../DatasetForm';

test('renders the form correctly', () => {
  const renderer = TestRenderer.create(<DatasetForm/>).toJSON();

  expect(renderer).toMatchSnapshot();
});
