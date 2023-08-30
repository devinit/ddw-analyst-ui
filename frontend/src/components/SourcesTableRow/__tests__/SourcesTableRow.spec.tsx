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
  value: 0,
};

const props1: SourcesTableRowProps = {
  source: Map({
    indicator: 'Frozen Common Reporting Standard End-to-end test freeze data source 20230822',
    indicator_acronym: 'crs',
    last_updated_on: '2023-08-22T08:38:29.764694Z',
  }) as SourceMap,
  onShowDatasets: jest.fn(),
  onShowMetadata: jest.fn(),
  onShowHistory: jest.fn(),
  value: 1,
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

test('history button is hidden for frozen sources', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);
  const { getByTestId } = render(<SourcesTableRow {...props1} />, {
    container: document.body.appendChild(tableBody),
  });

  const actions = getByTestId('source-table-row-actions') as HTMLElement;
  expect(actions).toBeDefined();
  expect(actions).not.toContain('Versions');
});
