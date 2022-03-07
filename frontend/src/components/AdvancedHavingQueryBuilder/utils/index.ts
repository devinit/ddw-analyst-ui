import {
  AdvancedQueryColumn,
  AdvancedQueryOptions,
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderHavingComparator,
} from '../../../types/operations';
import { Column, ColumnList } from '../../../types/sources';

export const sortAggregateOptions = (options: string[], selected: string): string[] => {
  if (options.indexOf(selected) === 0) {
    return options;
  }
  const firstOption = options[0];
  const selectedOptionIndex = options.indexOf(selected);
  options[0] = selected;
  options[selectedOptionIndex] = firstOption;

  return options;
};

export const getColumnFromAlias = (
  alias: string,
  columns: AdvancedQueryColumn[],
): AdvancedQueryColumn => columns.find((col) => col.alias === alias) as AdvancedQueryColumn;

export const getHavingQueryValues = (query: JqueryQueryBuilderHaving): JqueryQueryBuilderHaving => {
  query.rules?.map((rule, index: number) => {
    if (rule.hasOwnProperty('condition')) {
      getHavingQueryValues(rule as JqueryQueryBuilderHaving);
    } else {
      const element = (
        (query as JqueryQueryBuilderHaving)['rules'] as JqueryQueryBuilderHavingComparator[]
      )[index];
      if ('plain' in (element.value as { plain: string | number })) {
        element.value = (element.value as { plain: string | number })['plain'];
      } else {
        const activeValue: { column: string; aggregate: string } = element.value as {
          column: string;
          aggregate: string;
        };
        element.value = `${activeValue?.column},${activeValue.aggregate}`;
      }
    }
  });

  return query;
};
export const getGroupByColumns = ({
  columns,
  groupby: columnNames,
}: AdvancedQueryOptions): AdvancedQueryColumn[] | undefined =>
  columns?.filter((col) => col.name && columnNames?.includes(col.name));

export const isNumeric = (columns: Column[], column: AdvancedQueryColumn): boolean =>
  !!columns.find((col) => col.name === column.name && col.data_type === 'N');
export const hasAggregate = (columns?: AdvancedQueryColumn[]): boolean =>
  !!columns?.find((column: AdvancedQueryColumn) => column.aggregate);
export const hasNumericColumns = (columns: ColumnList, options: AdvancedQueryOptions): boolean =>
  !!getGroupByColumns(options)?.find((column) => isNumeric(columns.toJS() as Column[], column));
export const getAggregateColumns = (columns: AdvancedQueryColumn[] = []): AdvancedQueryColumn[] =>
  columns.filter((column) => column.aggregate);
