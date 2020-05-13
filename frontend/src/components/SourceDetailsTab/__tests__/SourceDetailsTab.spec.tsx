/**
 * @jest-environment jsdom
 */
import { List, Map } from 'immutable';
import * as React from 'react';
import { render } from '@testing-library/react';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../../types/sources';
import { SourceDetailsTab } from '../SourceDetailsTab';

jest
  .spyOn(Date.prototype, 'toString')
  .mockImplementation(() => 'Sun Aug 19 2018 23:15:30 GMT+0300 (East Africa Time)');

const columns: ColumnList = List([
  Map({ source_name: 'Column 1', description: 'Column One' }),
]) as ColumnList;
const updateHistory: UpdateHistoryList = List([
  Map({
    released_on: new Date('August 19, 2018 23:15:30').toISOString(),
    release_description: 'My Release',
  }),
]) as UpdateHistoryList;
const source: SourceMap = Map({
  columns,
  update_history: updateHistory,
  source_acronym: 'msc',
}) as SourceMap;

test('renders correctly with default props', () => {
  const { container } = render(<SourceDetailsTab source={source} />);

  expect(container).toMatchSnapshot();
});
