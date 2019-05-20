import { List, Map } from 'immutable';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../../types/sources';
import { SourceMetadata } from '../SourceMetadata';

const columns: ColumnList = List([ Map({ source_name: 'Column 1', description: 'Column One' }) ]) as ColumnList;
const updateHistory: UpdateHistoryList = List([
  Map({ released_on: new Date('August 19, 2018 23:15:30').toISOString(), release_description: 'My Release' })
]) as UpdateHistoryList;
const source: SourceMap = Map({ columns, update_history: updateHistory, source_acronym: 'msc' }) as SourceMap;

test('renders correctly with default props', () => {
  const renderer = TestRenderer.create(<SourceMetadata source={ source }/>).toJSON();

  expect(renderer).toMatchSnapshot();
});
