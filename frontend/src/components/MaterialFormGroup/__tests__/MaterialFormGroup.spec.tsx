/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';
import { render } from '@testing-library/react';
import * as TestRenderer from 'react-test-renderer';
import { MaterialFormGroup } from '../MaterialFormGroup';

test('renders the component correctly', () => {
  const renderer = TestRenderer.create(
    <MaterialFormGroup
      md="8"
      id="title"
      name="title"
      required
      onChange={ jest.fn() }
      onFocus={ jest.fn() }
      onBlur={ jest.fn() }
    />
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the form group with the class is-focused when focused', () => {
  const { getByTestId } = render(
    <MaterialFormGroup
      md="8"
      id="title"
      name="title"
      required
      onChange={ jest.fn() }
      onFocus={ jest.fn() }
      onBlur={ jest.fn() }
      focused
    />
  );

  expect(getByTestId('material-form-group')).toHaveClass('is-focused');
});

test('renders the form group with the class is-filled when the input has a value', () => {
  const { getByTestId } = render(
    <MaterialFormGroup
      md="8"
      id="title"
      name="title"
      required
      onChange={ jest.fn() }
      onFocus={ jest.fn() }
      onBlur={ jest.fn() }
      value="testing"
    />
  );

  expect(getByTestId('material-form-group')).toHaveClass('is-filled');
});

test('does not show errors when not touched', () => {
  const { getByTestId } = render(
    <MaterialFormGroup
      md="8"
      id="title"
      name="title"
      required
      onChange={ jest.fn() }
      onFocus={ jest.fn() }
      onBlur={ jest.fn() }
      touched={ false }
      errors="This field is invalid"
    />
  );

  expect(getByTestId('material-form-control-feedback')).not.toHaveTextContent('This field is invalid');
});

test('shows supplied errors when touched', () => {
  const { getByTestId } = render(
    <MaterialFormGroup
      md="8"
      id="title"
      name="title"
      required
      onChange={ jest.fn() }
      onFocus={ jest.fn() }
      onBlur={ jest.fn() }
      touched
      errors="This field is invalid"
    />
  );

  expect(getByTestId('material-form-control-feedback')).toHaveTextContent('This field is invalid');
});
