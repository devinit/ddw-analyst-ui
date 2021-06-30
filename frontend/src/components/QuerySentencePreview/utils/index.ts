import { AdvancedQueryOptions } from '../../../types/operations';

/**
 * Returns an empty string for valid options
 * @param options AdvancedQueryOptions - the configs to validate
 * @returns string - a validation error message
 */
export const validateOptions = (options: AdvancedQueryOptions): string => {
  if (!options.source) return 'A data source is required';

  return '';
};
