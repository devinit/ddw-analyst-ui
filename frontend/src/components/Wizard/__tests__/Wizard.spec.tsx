/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Wizard } from '../Wizard';

describe('Wizard', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<Wizard />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <Wizard>
        <div>My Child</div>
      </Wizard>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
