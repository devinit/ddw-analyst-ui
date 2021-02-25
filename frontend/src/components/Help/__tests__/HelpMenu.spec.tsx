/**
 * @jest-environment jsdom
 */
import 'jest-styled-components';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MenuLink } from '../../../types/help';
import { HelpMenu } from '../HelpMenu';

describe('HelpMenu', () => {
  const links: MenuLink[] = [];
  beforeEach(() => {
    links[0] = {
      caption: 'Item 1',
      url: 'https://staging-ddw.devinit.org',
    };
    links[1] = {
      caption: 'Item 2',
      url: 'https://ddw.devinit.org',
    };
  });
  afterEach(cleanup);

  test('renders correctly with the required link properties', () => {
    const renderer = TestRenderer.create(<HelpMenu links={links} />).toJSON();

    expect(renderer).toMatchSnapshot();
  });

  test('renders a divider', () => {
    links[0].addDividerAfter = true;

    const { container } = render(<HelpMenu links={links} />);
    const divider = container.children[1];

    expect(divider).toHaveClass('dropdown-divider');
    expect(divider).toHaveAttribute('role', 'separator');
  });

  test('renders a disabled link', () => {
    links[1].disabled = true;

    const { container } = render(<HelpMenu links={links} />);
    const disabledLink = container.children[1];

    expect(disabledLink).toHaveClass('disabled');
  });
});
