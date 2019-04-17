/**
 * @jest-environment jsdom
 */
import { List, Map } from 'immutable';
import * as React from 'react';
import { cleanup, render } from 'react-testing-library';
import * as TestRenderer from 'react-test-renderer';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../../types/sources';
import { SourcesTable } from '../SourcesTable';

const columns: ColumnList = List([ Map({ source_name: 'Column 1', description: 'Column One' }) ]) as ColumnList;
const updateHistory: UpdateHistoryList = List([
  Map({ released_on: new Date('August 19, 2018 23:15:30').toISOString(), release_description: 'My Release' })
]) as UpdateHistoryList;
const source: SourceMap = Map({
  id: 1,
  indicator: 'Common Reporting Standard',
  indicator_acronym: 'crs',
  columns,
  update_history: updateHistory,
  source_acronym: 'oecd',
  last_updated_on: new Date('August 19, 2018 23:15:30').toISOString()
}) as SourceMap;
const source2 = source
  .set('id', 2)
  .set('indicator', 'World Bank Indicators')
  .set('indicator_acronym', 'wdi')
  .set('last_updated_on', new Date('August 19, 2018 23:15:30').toISOString());
let sourcesList: List<SourceMap> = List([ source, source2 ]);

afterEach(cleanup);

test('renders correctly with default props', () => {
  const renderer = TestRenderer
    .create(<SourcesTable activeSource={ source } sources={ sourcesList } onRowClick={ jest.fn() }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders an empty table if no sources are provided', () => {
  const renderer = TestRenderer
    .create(<SourcesTable activeSource={ source } sources={ List() } onRowClick={ jest.fn() }/>)
    .toJSON();

  expect(renderer).toMatchSnapshot();
});

test('renders correctly when the sources are updated', () => {
  const { container, rerender } = render(
    <SourcesTable activeSource={ source } sources={ sourcesList } onRowClick={ jest.fn() }/>
  );
  sourcesList = sourcesList.push(source
    .set('id', 3)
    .set('indicator', 'Official Development Assistance')
    .set('indicator_acronym', 'DAC1')
    .set('last_updated_on', new Date('August 19, 2018 23:15:30').toISOString()));
  rerender(<SourcesTable activeSource={ source } sources={ sourcesList } onRowClick={ jest.fn() }/>);

  expect(container).toMatchSnapshot();
});
