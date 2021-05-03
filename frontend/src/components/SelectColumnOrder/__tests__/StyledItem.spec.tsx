import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { StyledItem } from '../StyledItem';

describe('StyledItem', () => {
  test('renders correctly with the required props', () => {
    const renderer = TestRenderer.create(<StyledItem />).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
