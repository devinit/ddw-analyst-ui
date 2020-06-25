/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardNavigationItem } from '../WizardNavigationtem';

describe('WizardNavigationItem', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardNavigationItem />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardNavigationItem>
        <div>My Child</div>
      </WizardNavigationItem>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
