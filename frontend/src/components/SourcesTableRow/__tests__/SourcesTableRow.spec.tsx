/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import { fireEvent, render } from '@testing-library/react';
import { Map } from 'immutable';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SourceMap } from '../../../types/sources';
import { SourcesTableRow, SourcesTableRowProps } from '../SourcesTableRow';

const props: SourcesTableRowProps = {
  source: Map({
    indicator: 'World Bank Indicators',
    indicator_acronym: 'wbi',
    last_updated_on: 'August 19, 2018 23:15:30',
  }) as SourceMap,
  onShowDatasets: jest.fn(),
  onShowMetadata: jest.fn(),
  onShowHistory: jest.fn(),
};

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(<SourcesTableRow {...props} />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('metadata button responds to click events', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);
  const { getByTestId } = render(<SourcesTableRow {...props} />, {
    container: document.body.appendChild(tableBody),
  });

  const button = getByTestId('sources-table-metadata-button') as HTMLElement;
  expect(button).toBeDefined();
  expect(button).not.toBeNull();
  if (button) fireEvent.click(button);

  expect(props.onShowMetadata).toHaveBeenCalled();
});

test('dataset button responds to click events', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);
  const { getByTestId } = render(<SourcesTableRow {...props} />, {
    container: document.body.appendChild(tableBody),
  });

  const button = getByTestId('sources-table-dataset-button') as HTMLElement;
  expect(button).toBeDefined();
  expect(button).not.toBeNull();
  if (button) fireEvent.click(button);

  expect(props.onShowDatasets).toHaveBeenCalled();
});

test('history button responds to click events', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);
  const { getByTestId } = render(<SourcesTableRow {...props} />, {
    container: document.body.appendChild(tableBody),
  });

  const button = getByTestId('sources-table-history-button') as HTMLElement;
  expect(button).toBeDefined();
  expect(button).not.toBeNull();
  if (button) fireEvent.click(button);

  expect(props.onShowHistory).toHaveBeenCalled();
});
