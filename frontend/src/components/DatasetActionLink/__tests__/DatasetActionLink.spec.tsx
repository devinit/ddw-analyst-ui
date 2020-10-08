/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { List, Map } from 'immutable';
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Operation, OperationMap } from '../../../types/operations';
import { DatasetActionLink } from '../DatasetActionLink';

const operation: Partial<Operation> = {
  id: 23,
  name: 'My Test Dataset',
  description: 'My Dataset Description',
  updated_on: new Date('2020-01-02').toISOString(),
  is_draft: false,
  operation_steps: List(),
};
const props = {
  operation: Map(operation) as OperationMap,
};

describe('DatasetActionLink', () => {
  test('renders correctly with the default props', () => {
    const renderer = TestRenderer.create(<DatasetActionLink {...props} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('does not render a link when show is false', () => {
    const renderer = TestRenderer.create(<DatasetActionLink {...props} show={false} />).toJSON();

    expect(renderer).toBeNull();
  });

  test('renders with the provided path', () => {
    const path = '/dataset/action/link';
    render(<DatasetActionLink {...props} path={path} />);
    const link = screen.getByTestId('dataset-action');

    expect(link.getAttribute('href')).toBe(path);
  });

  test('with no path and action edit renders the appropriate link', () => {
    render(<DatasetActionLink {...props} action="edit" />);
    const link = screen.getByTestId('dataset-action');

    expect(link.getAttribute('href')).toBe('/queries/build/23/');
  });

  test('responds to clicks', () => {
    const onClick = jest.fn();
    render(<DatasetActionLink {...props} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('dataset-action'));

    expect(onClick).toHaveBeenCalled();
  });
});
