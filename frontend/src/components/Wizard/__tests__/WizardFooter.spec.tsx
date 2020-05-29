/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardFooter } from '../WizardFooter';

describe('WizardFooter', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardFooter />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardFooter>
        <div>My Child</div>
      </WizardFooter>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
