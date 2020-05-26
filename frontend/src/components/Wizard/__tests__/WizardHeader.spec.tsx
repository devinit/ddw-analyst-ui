/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardHeader } from '../WizardHeader';

describe('WizardHeader', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardHeader />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardHeader>
        <div>My Child</div>
      </WizardHeader>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
