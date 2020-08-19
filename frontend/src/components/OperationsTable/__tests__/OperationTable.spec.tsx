/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { OperationsTableRow, OperationsTableRowProps } from '../../OperationsTableRow';
import { OperationsTable } from '../OperationsTable';

describe('OperationsTable', () => {
  test('renders correctly with the default props', () => {
    const renderer = TestRenderer.create(<OperationsTable />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('only renders OperationsTableRow children', () => {
    const props: OperationsTableRowProps = {
      count: 2,
      name: 'My Test Dataset',
      updatedOn: new Date('2020-01-01').toISOString(),
      isDraft: false,
    };
    const renderer = TestRenderer.create(
      <OperationsTable {...props}>
        <button type="button">Click Me</button>
        <OperationsTableRow {...props} />
      </OperationsTable>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
