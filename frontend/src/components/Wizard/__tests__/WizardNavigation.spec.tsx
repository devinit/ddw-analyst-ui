/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import 'jest-styled-components';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardNavigation } from '../WizardNavigation';

describe('WizardNavigation', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardNavigation />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardNavigation>
        <div>My Child</div>
      </WizardNavigation>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
