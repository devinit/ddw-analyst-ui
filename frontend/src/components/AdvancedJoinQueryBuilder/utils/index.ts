import { List } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';
import { AdvancedQueryOptions } from '../../../types/operations';
import { SourceMap } from '../../../types/sources';

export const hasJoinConfig = (options: AdvancedQueryOptions): boolean => !!options.join;
export const joinTypes: DropdownItemProps[] = [
  { key: 'inner', text: 'Inner Join', value: 'inner' },
  { key: 'outer', text: 'Outer Join', value: 'outer' },
  { key: 'left', text: 'Left Join', value: 'left' },
  { key: 'right', text: 'Right Join', value: 'right' },
  { key: 'full', text: 'Full Join', value: 'full' },
  { key: 'cross', text: 'Cross Join', value: 'cross' },
  { key: 'left_outer', text: 'Left Outer Join', value: 'left_outer' },
  { key: 'right_outer', text: 'Right Outer Join', value: 'right_outer' },
];
