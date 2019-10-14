/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import { DatasetTableRow } from '../DatasetTableRow';
import { Dataset } from '../../../types/datasets';

const defaultDataset: Partial<Dataset> = {
  title: 'Dataset 1',
  publication: 'My first dataset',
  releasedAt: new Date('Tue Oct 08 2019').toDateString()
};

test('renders the default component correctly', () => {
  const renderer = TestRenderer.create(
    <DatasetTableRow dataset={ defaultDataset as Dataset } />
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders all component children as actions', () => {
  const actionContent = 'Actions Go Here!';
  const actionTestID = 'action-element';
  const tableBody = document.createElement('tbody');
  const { getByTestId } = render(
    <DatasetTableRow dataset={ defaultDataset as Dataset }>
      <div data-testid={ actionTestID }>{ actionContent }</div>
    </DatasetTableRow>,
    { container: document.body.appendChild(tableBody) }
  );
  const testElement = getByTestId(actionTestID);

  expect(testElement).toHaveTextContent(actionContent);
  expect(testElement.parentElement).toMatchInlineSnapshot(`
    <td
      class="td-actions text-right"
    >
      <div
        data-testid="action-element"
      >
        Actions Go Here!
      </div>
    </td>
  `);
});
