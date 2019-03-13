/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from 'react-testing-library';
import { SourcesTableRow, SourcesTableRowProps } from '../SourcesTableRow';

const props: SourcesTableRowProps = {
  onClick: jest.fn(),
  count: 1,
  indicator: 'World Bank Indicators',
  indicatorAcronym: 'wbi',
  updatedOn: new Date('August 19, 2018 23:15:30').toISOString()
};

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(<SourcesTableRow { ...props }/>).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('responds to click events', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);
  const { getByTestId } = render(<SourcesTableRow { ...props }/>, {
    container: document.body.appendChild(tableBody)
  });

  fireEvent.click(getByTestId('sources-table-row'));

  expect(props.onClick).toHaveBeenCalled();
});
