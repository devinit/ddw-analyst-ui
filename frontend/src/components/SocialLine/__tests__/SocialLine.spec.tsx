import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { SocialLine } from '../SocialLine';

test('renders only the wrapper when no social options are specified', () => {
  const renderer = TestRenderer.create(<SocialLine />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the google button when google is set to true', () => {
  const renderer = TestRenderer.create(<SocialLine google />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the facebook button when facebook is set to true', () => {
  const renderer = TestRenderer.create(<SocialLine facebook />).toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders the twitter button when twitter is set to true', () => {
  const renderer = TestRenderer.create(<SocialLine twitter />).toJSON();

  expect(renderer).toMatchSnapshot();
});
