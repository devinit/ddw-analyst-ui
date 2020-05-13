import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SidebarContent } from '../SidebarContent';
import { SidebarItem } from '../../SidebarItem';

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(<SidebarContent />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders SidebarItem components', () => {
  const renderer = TestRenderer.create(
    <SidebarContent>
      <SidebarItem />
    </SidebarContent>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders only SidebarItem components', () => {
  const renderer = TestRenderer.create(
    <SidebarContent>
      <div>Awesome</div>
    </SidebarContent>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});
