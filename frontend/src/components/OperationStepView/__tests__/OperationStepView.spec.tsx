/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { Map } from 'immutable';
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { OperationStep, OperationStepMap } from '../../../types/operations';
import { OperationStepView } from '../OperationStepView';

const step: Partial<OperationStep> = {
  name: 'My Test Step',
  updated_on: new Date('2020-01-02').toISOString(),
  query_func: 'filter',
  query_kwargs: 'kwargs',
};

const props = {
  step: Map(step) as OperationStepMap,
  onDuplicateStep: jest.fn(),
};

describe('OperationStep', () => {
  afterEach(() => {
    props.step = Map(step) as OperationStepMap;
  });

  test('renders correctly with the default props', () => {
    const renderer = TestRenderer.create(<OperationStepView {...props} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders an info button when the provided step has a description', () => {
    props.step = Map({ ...step, description: 'My Step Description' }) as OperationStepMap;
    const renderer = TestRenderer.create(<OperationStepView {...props} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders a copy button that responds to clicks', () => {
    render(<OperationStepView {...props} />);
    const copyButton = screen.getByTestId('step-duplicate');
    fireEvent.click(copyButton);

    expect(props.onDuplicateStep).toHaveBeenCalled();
  });
});
