import {
  AdvancedQueryColumn,
  AdvancedQueryOptions,
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderHavingComparator,
} from '../../../types/operations';

export const getColumnFromAlias = (
  alias: string,
  columns: AdvancedQueryColumn[],
): AdvancedQueryColumn => columns.find((col) => col.alias === alias) as AdvancedQueryColumn;

export const getGroupColumns = (options: AdvancedQueryOptions): AdvancedQueryColumn[] =>
  options.columns?.filter((col) =>
    options.groupby?.includes(col.name as string),
  ) as AdvancedQueryColumn[];

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
