import { Set } from 'immutable';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryColumn,
  AdvancedQueryOptions,
} from '../../../types/operations';
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
  if (source.get('id') !== options.source) return ['Configured source must match selected source'];
  if (!options.selectall && !options.columns?.length) {
    return ['Select at least one column to return'];
  }
  if (options.columns?.length) {
    const errors = validateColumns(source, options.columns);
    if (errors.length) return errors;
  }
  if (options.filter) {
    const columns = source.get('columns') as ColumnList;
    const columnSet = Set(columns.map((column) => column.get('name') as string));
    const columnItems = QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);

    return validateFilter(options.filter, columnItems);
  }

  for (let index = 0; options.join && index < options.join.length; index++) {
    if (options.join && !options.join[index].type) return ['Join type is required'];
    if (options.join && !options.join[index].source) return ['Join source is required'];
    if (options.join && !options.join[index].mapping.length) {
      return ['At least one join mapping is required'];
    }
    if (options.join && !options.join[index].columns?.length) {
      return ['At least one join column is required'];
    }
    if (options.join && options.join[index].columns?.length) {
      const errors = validateColumns(source, options.join[index].columns!, 'join');
      if (errors.length) return errors;
    }
  }

  if (options.groupby && !options.groupby.length) return ['Group by requires at least one column'];

  return [];
};

const validateColumns = (
  source: SourceMap,
  columns: AdvancedQueryColumn[],
  usage: 'select' | 'join' = 'select',
): string[] => {
  const errors: string[] = [];
  // const usagePrefix = usage === 'select' ? 'Select' : 'Join';
  const sourceColumns = source.get('columns') as ColumnList;
  columns.forEach((column, index) => {
    if (!column.id) {
      errors.push(`ID is required for ${usage} column ${index + 1}`);
    }
    if (!column.name) {
      errors.push(`Column name is required for ${usage} column ${index + 1}`);
    } else if (usage !== 'join') {
      // TODO: validate join columns - they require to be fetched from their own source
      const matchingColumn = sourceColumns.find((_column) => _column.get('name') === column.name);
      if (!matchingColumn) {
        errors.push(`Invalid column name (${column.name}) for ${usage} column ${index + 1}`);
      }
    }
    if (!column.alias) {
      errors.push(`Column alias is required for ${usage} column ${index + 1}`);
    }
  });

  return errors;
};

export const getClauseOptions = (
  options: AdvancedQueryOptions,
  clause?: AdvancedQueryBuilderAction,
): Partial<AdvancedQueryOptions> => {
  if (clause === 'select') {
    const { selectall, columns, groupby, source } = options;

    return { selectall, columns, groupby, source };
  }
  if (clause === 'filter') return { filter: options.filter };
  if (clause === 'join') return { join: options.join };
  if (clause === 'groupby') return { groupby: options.groupby };

  return options;
};

export const resetClauseOptions = (
  options: AdvancedQueryOptions,
  clause?: AdvancedQueryBuilderAction,
  clearAll?: boolean,
): AdvancedQueryOptions => {
  const _options = { ...options };
  if (clearAll) {
    return { source: _options.source, selectall: true };
  } else {
    if (clause === 'select') {
      delete _options.columns;

      return { ..._options, selectall: true };
    }
    if (clause === 'filter' && options.filter) delete _options.filter;
    if (clause === 'join' && options.join) delete _options.join;
    if (clause === 'groupby' && options.groupby) delete _options.groupby;
  }

  return _options;
};
