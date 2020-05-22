/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardHeaderItem } from '../WizardHeaderItem';

describe('WizardHeaderItem', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardHeaderItem />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardHeaderItem>
        <div>My Child</div>
      </WizardHeaderItem>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
