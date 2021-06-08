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
    visibleFor: ['select', 'join'],
  },
  {
    name: 'join',
    caption: 'Join',
    visibleFor: ['select', 'filter'],
  },
  {
    name: 'groupby',
    caption: 'Group By',
    visibleFor: ['select', 'filter'],
  },
  {
    name: 'having',
    caption: 'Having',
    visibleFor: ['select', 'filter', 'groupby'],
  },
  {
    name: 'orderby',
    caption: 'Order By',
    visibleFor: [],
  },
];

export const getSupportedActions = (
  actions: ActionMeta[],
  activeAction: AdvancedQueryBuilderAction,
): ActionMeta[] =>
  actions.filter(
    (action) => action.visibleFor.length === 0 || action.visibleFor.includes(activeAction),
  );

export const getSelectOptionsFromActions = (
  actions: ActionMeta[],
  enabledActions?: ActionMeta[],
): DropdownItemProps[] =>
  actions.map((action) => ({
    key: action.name,
    text: action.caption,
    value: action.name,
    disabled: enabledActions && !enabledActions.find((act) => act.name === action.name),
  }));
