/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WindowQueryBuilder, positionalFunction, termFunctions } from '../WindowQueryBuilder';
import { List, fromJS } from 'immutable';
import { SourceMap } from '../../../types/sources';
import { OperationStepMap } from '../../../types/operations';

const source: SourceMap = fromJS({
  columns: [
    {
      id: 1,
      name: 'column_a',
      description: 'first column',
      source_name: 'my source',
      data_type: 'N',
    },
  ],
}) as SourceMap;
const step: OperationStepMap = fromJS({
  id: 1,
  step_id: 1,
  name: 'first step',
  description: 'first step',
}) as OperationStepMap;
const steps: List<OperationStepMap> = List([step]);

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(
    <WindowQueryBuilder source={source} step={step} steps={steps} />,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the term, over and order_by when the function is a term function', () => {
  termFunctions.forEach((func) => {
    const renderer = TestRenderer.create(
      <WindowQueryBuilder source={source} step={step} steps={steps} function={func} />,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});

test('renders the term and order_by when the function is a positional function', () => {
  positionalFunction.forEach((func) => {
    const renderer = TestRenderer.create(
      <WindowQueryBuilder source={source} step={step} steps={steps} function={func} />,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});

test('does not render the term, over and order_by for an optionless function', () => {
  ['DenseRank', 'Rank'].forEach((func) => {
    const renderer = TestRenderer.create(
      <WindowQueryBuilder source={source} step={step} steps={steps} function={func} />,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
