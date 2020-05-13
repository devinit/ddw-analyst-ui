import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { PageWrapper } from '../PageWrapper';

test('renders with no children', () => {
  const renderer = TestRenderer.create(<PageWrapper />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with children', () => {
  const renderer = TestRenderer.create(<PageWrapper>My Child</PageWrapper>).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders with the wrapper-full-page class when set to fullPage', () => {
  const renderer = TestRenderer.create(<PageWrapper fullPage>My Child</PageWrapper>).toJSON();

  expect(renderer).toMatchSnapshot();
});
