/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { List, Map } from 'immutable';
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Operation, OperationMap } from '../../../types/operations';
import OperationsTableRowActions from '../../OperationsTableRowActions';
import { OperationsTableRow, OperationsTableRowProps } from '../OperationsTableRow';

const operation: Partial<Operation> = {
  name: 'My Test Dataset',
  description: 'My Dataset Description',
  updated_on: new Date('2020-01-02').toISOString(),
  is_draft: false,
  operation_steps: List(),
};
const props: OperationsTableRowProps = {
  operation: Map(operation) as OperationMap,
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

  test('that is a configured to show a draft badge renders a draft badge of warning variant for draft operations', () => {
    const { getByTestId } = render(
      <OperationsTableRow
        operation={Map({ ...operation, is_draft: true }) as OperationMap}
        showDraftBadge
      />,
    );
    const badge = getByTestId('draft-span');

    expect(badge.classList).toContain('badge-warning');
    expect(badge.innerHTML).toBe('Draft');
  });

  test('that is not a draft does not render a draft badge', () => {
    const { queryByTestId } = render(<OperationsTableRow {...props} showDraftBadge />);
    const badge = queryByTestId('draft-span');

    expect(badge).toBeNull();
  });
});
