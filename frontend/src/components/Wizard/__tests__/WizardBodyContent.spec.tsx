/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { WizardBodyContent } from '../WizardBodyContent';

describe('WizardBodyContent', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardBodyContent />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children', () => {
    const renderer = TestRenderer.create(
      <WizardBodyContent>
        <div>My Child</div>
      </WizardBodyContent>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });
});
