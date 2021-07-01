import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../../types/operations';

/**
 * Returns an empty string for valid options
 * @param options AdvancedQueryOptions - the configs to validate
 * @returns string - a validation error message
 */
export const validateOptions = (options: AdvancedQueryOptions): string => {
  if (!options.source) return 'A data source is required';

  return '';
};

export const getClauseOptions = (
  options: AdvancedQueryOptions,
  clause?: AdvancedQueryBuilderAction,
): Partial<AdvancedQueryOptions> => {
  if (clause === 'select') {
    const { selectall, columns, groupby } = options;

    return { selectall, columns, groupby };
  }
  if (clause === 'filter') return { filter: options.filter };
  if (clause === 'join') return { join: options.join };
  if (clause === 'groupby') return { groupby: options.groupby };

  return options;
};
