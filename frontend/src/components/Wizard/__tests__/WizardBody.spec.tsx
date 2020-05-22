/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardBody } from '../WizardBody';

describe('WizardBody', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardBody />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardBody>
        <div>My Child</div>
      </WizardBody>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
