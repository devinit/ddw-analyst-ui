import {
  AdvancedQueryBuilderAction,
  AdvancedQueryOptionsMap,
  OperationMap,
} from '../../../types/operations';

export const getCurrentAction = (operation?: OperationMap): AdvancedQueryBuilderAction => {
  const query = operation && (operation.get('advanced_config') as AdvancedQueryOptionsMap);
  if (query) {
    const queryObject = query.toJS();
    if (Object.hasOwnProperty.call(queryObject, 'filter')) {
      return 'filter';
    }
    if (Object.hasOwnProperty.call(queryObject, 'columns')) {
      return 'select';
    }
    if (Object.hasOwnProperty.call(queryObject, 'join')) {
      return 'join';
    }
    if (Object.hasOwnProperty.call(queryObject, 'groupby')) {
      return 'groupby';
    }
  }

  return 'select';
};
