/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import { WizardBodyContent } from '../WizardBodyContent';

describe('WizardBodyContent', () => {
  test('renders the default structure correctly', () => {
    const renderer = TestRenderer.create(<WizardBodyContent />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders with children when active', () => {
    const renderer = TestRenderer.create(
      <WizardBodyContent active>
        <div>My Child</div>
      </WizardBodyContent>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders no children when inactive by default', () => {
    const renderer = TestRenderer.create(
      <WizardBodyContent>
        <div>My Child</div>
      </WizardBodyContent>,
    ).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('always renders with children when viewed', () => {
    const { getByTestId, rerender } = render(
      <WizardBodyContent>
        <div>My Child</div>
      </WizardBodyContent>,
    );
    const tabPane = getByTestId('wizard-tab-pane');

    expect(tabPane.innerHTML).toBe('');

    rerender(
      <WizardBodyContent active>
        <div>My Child</div>
      </WizardBodyContent>,
    );

    expect(tabPane.innerHTML).toBe('<div>My Child</div>');

    rerender(
      <WizardBodyContent>
        <div>My Child</div>
      </WizardBodyContent>,
    );

    expect(tabPane.innerHTML).toBe('<div>My Child</div>');
  });
});
