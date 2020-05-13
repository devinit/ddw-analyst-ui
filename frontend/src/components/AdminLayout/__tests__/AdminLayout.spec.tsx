import * as React from 'react';
import { Navbar } from 'react-bootstrap';
import * as TestRenderer from 'react-test-renderer';
import { Sidebar } from '../../Sidebar';
import { AdminLayout } from '../AdminLayout';
import { AdminLayoutContent } from '../AdminLayoutContent';

test('renders a loading indicator with the default props', () => {
  const renderer = TestRenderer.create(<AdminLayout />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the layout when not loading', () => {
  const renderer = TestRenderer.create(<AdminLayout loading={false} />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('does not render invalid children', () => {
  const renderer = TestRenderer.create(
    <AdminLayout loading={false}>
      <div>Awesome</div>
    </AdminLayout>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders a Sidebar when one is added as a child', () => {
  const renderer = TestRenderer.create(
    <AdminLayout loading={false}>
      <Sidebar dataColour="azure" backgroundColour="red" />
    </AdminLayout>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders a Navbar when one is added as a child', () => {
  const renderer = TestRenderer.create(
    <AdminLayout loading={false}>
      <Navbar />
    </AdminLayout>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders AdminLayoutContent when one is added as a child', () => {
  const renderer = TestRenderer.create(
    <AdminLayout loading={false}>
      <AdminLayoutContent />
    </AdminLayout>,
  ).toJSON();

  expect(renderer).toMatchSnapshot();
});
