import { Set } from 'immutable';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../../types/operations';
import { ColumnList, SourceMap } from '../../../types/sources';
import { validateFilter } from '../../AdvancedFilterQueryBuilder/utils';
import { QueryBuilderHandler } from '../../QueryBuilderHandler';

/**
 * Returns an empty string for valid options
 * @param options AdvancedQueryOptions - the configs to validate
 * @returns string - a validation error message
 */
export const validateOptions = (options: AdvancedQueryOptions, source: SourceMap): string[] => {
  // TODO: add advanced validation e.g source & column validation for select & join
  if (!options.source) return ['A data source is required'];
  if (!options.selectall && !options.columns?.length) {
    return ['Select at least one column to return'];
  }
  if (options.filter) {
    const columns = source.get('columns') as ColumnList;
    const columnSet = Set(columns.map((column) => column.get('name') as string));
    const columnItems = QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);

    return validateFilter(options.filter, columnItems);
  }

  return [];
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
