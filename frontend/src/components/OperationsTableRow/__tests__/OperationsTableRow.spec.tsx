/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import OperationsTableRowActions from '../../OperationsTableRowActions';
import { OperationsTableRow, OperationsTableRowProps } from '../OperationsTableRow';

const props: OperationsTableRowProps = {
  count: 2,
  name: 'My Test Dataset',
  updatedOn: new Date('2020-01-01').toISOString(),
  isDraft: false,
};

describe('OperationsTableRow', () => {
  test('renders correctly with the default props', () => {
    const renderer = TestRenderer.create(<OperationsTableRow {...props} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders actions when provided', () => {
    const renderer = TestRenderer.create(
      <OperationsTableRow {...props}>
        <OperationsTableRowActions>
          <button type="button">Click Me</button>
        </OperationsTableRowActions>
      </OperationsTableRow>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('does not render non-action children', () => {
    const renderer = TestRenderer.create(
      <OperationsTableRow {...props}>
        <button type="button">Click Me</button>
      </OperationsTableRow>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('that is a draft renders a draft badge of warning variant', () => {
    const { getByTestId } = render(<OperationsTableRow {...props} isDraft></OperationsTableRow>, {
      container: document.createElement('tbody'),
    });
    const badge = getByTestId('op-table-row-badge');

    expect(badge.classList).toContain('badge-warning');
    expect(badge.innerHTML).toBe('Draft');
  });

  test('that is not a draft renders a published badge of danger variant', () => {
    const { getByTestId } = render(
      <OperationsTableRow {...props} isDraft={false}></OperationsTableRow>,
      {
        container: document.createElement('tbody'),
      },
    );
    const badge = getByTestId('op-table-row-badge');

    expect(badge.classList).toContain('badge-danger');
    expect(badge.innerHTML).toBe('Published');
  });
});
