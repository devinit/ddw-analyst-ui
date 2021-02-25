import 'jest-styled-components';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { HelpNavItem } from '../HelpNavItem';

describe('HelpNavItem', () => {
  test('renders correctly', () => {
    const renderer = TestRenderer.create(<HelpNavItem />).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
