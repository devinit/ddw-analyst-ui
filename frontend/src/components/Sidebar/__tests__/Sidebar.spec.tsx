import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Sidebar } from '../Sidebar';

test('renders correctly with the default props', () => {
  const renderer = TestRenderer.create(<Sidebar />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with the specified dataColour', () => {
  const azureRenderer = TestRenderer.create(<Sidebar dataColour="azure" />).toJSON();

  expect(azureRenderer).toMatchSnapshot();

  const dangerRenderer = TestRenderer.create(<Sidebar dataColour="danger" />).toJSON();

  expect(dangerRenderer).toMatchSnapshot();

  const greenRenderer = TestRenderer.create(<Sidebar dataColour="green" />).toJSON();

  expect(greenRenderer).toMatchSnapshot();

  const orangeRenderer = TestRenderer.create(<Sidebar dataColour="orange" />).toJSON();

  expect(orangeRenderer).toMatchSnapshot();

  const purpleRenderer = TestRenderer.create(<Sidebar dataColour="purple" />).toJSON();

  expect(purpleRenderer).toMatchSnapshot();

  const roseRenderer = TestRenderer.create(<Sidebar dataColour="rose" />).toJSON();

  expect(roseRenderer).toMatchSnapshot();
});

test('renders with the specified backgroundColour', () => {
  const blackRenderer = TestRenderer.create(<Sidebar backgroundColour="black" />).toJSON();

  expect(blackRenderer).toMatchSnapshot();

  const redRenderer = TestRenderer.create(<Sidebar backgroundColour="red" />).toJSON();

  expect(redRenderer).toMatchSnapshot();

  const whiteRenderer = TestRenderer.create(<Sidebar backgroundColour="white" />).toJSON();

  expect(whiteRenderer).toMatchSnapshot();
});

test('does not render invalid children', () => {
  const renderer = TestRenderer.create(
    <Sidebar>
      <div>Awesome</div>
    </Sidebar>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders a SidebarLogo when one is added as a child', () => {
  const renderer = TestRenderer.create(
    <Sidebar>
      <Sidebar.Logo />
    </Sidebar>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders a SidebarContent when one is added as a child', () => {
  const renderer = TestRenderer.create(
    <Sidebar>
      <Sidebar.Content />
    </Sidebar>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});
