import { DropdownItemProps } from 'semantic-ui-react';
import { AdvancedQueryBuilderAction } from '../../../types/operations';

interface ActionMeta {
  name: AdvancedQueryBuilderAction;
  caption: string;
  visibleFor: AdvancedQueryBuilderAction[];
}

export const actions: ActionMeta[] = [
  {
    name: 'select',
    caption: 'Select',
    visibleFor: [],
  },
  {
    name: 'filter',
    caption: 'Filter',
    visibleFor: ['select'],
  },
  {
    name: 'join',
    caption: 'Join',
    visibleFor: ['select', 'filter'],
  },
];

// export const getSupportedActions = (activeAction: AdvancedQueryBuilderAction) => {
//   return [];
// };

export const getSelectOptionsFromActions = (actions: ActionMeta[]): DropdownItemProps[] =>
  actions.map((action) => ({
    key: action.name,
    text: action.caption,
    value: action.name,
  }));
