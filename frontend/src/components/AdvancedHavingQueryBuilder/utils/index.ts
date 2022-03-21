import { RuleGroupType, generateID } from 'react-querybuilder';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
} from '../../../types/operations';
import { Column, ColumnList } from '../../../types/sources';
import { convertJqOperatorToDDW } from '../../JqueryQueryBuilder/utils';
import {
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderHavingComparator,
} from '../../JqueryQueryBuilder/utils/types';

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
  columns = [],
  groupby: columnNames,
}: AdvancedQueryOptions): AdvancedQueryColumn[] =>
  columns.filter((col) => col.name && columnNames?.includes(col.name));

export const isNumeric = (columns: Column[], column: AdvancedQueryColumn): boolean =>
  !!columns.find((col) => col.name === column.name && col.data_type === 'N');
export const hasAggregate = (columns?: AdvancedQueryColumn[]): boolean =>
  !!columns?.find((column: AdvancedQueryColumn) => column.aggregate);
export const hasNumericColumns = (columns: ColumnList, options: AdvancedQueryOptions): boolean =>
  !!getGroupByColumns(options)?.find((column) => isNumeric(columns.toJS() as Column[], column));
export const getAggregateColumns = (columns: AdvancedQueryColumn[] = []): AdvancedQueryColumn[] =>
  columns.filter((column) => column.aggregate);

export const parseHavingQueryReact = (
  finalElement: any,
  condition: string,
  rulesObject: any,
  aggregateColumns: AdvancedQueryColumn[],
  columns: AdvancedQueryColumn[],
): AdvancedQueryHaving => {
  console.log(finalElement, rulesObject);
  if (rulesObject.hasOwnProperty('combinator')) {
    finalElement[`$${rulesObject.combinator}`] = [];
    finalElement = parseHavingQueryReact(
      finalElement,
      rulesObject.combinator,
      rulesObject.rules,
      aggregateColumns,
      columns,
    );
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].combinator) {
        finalElement[`$${condition}`].push(
          parseHavingQueryReact(
            {},
            rulesObject[index].combinator,
            rulesObject[index].rules,
            aggregateColumns,
            columns,
          ),
        );
      } else {
        if (!finalElement.hasOwnProperty(`$${condition}`)) {
          finalElement[`$${condition}`] = [];
        }
        if ((aggregateColumns as AdvancedQueryColumn[]).length > 0) {
          aggregateColumns?.map((column) => {
            if (column.name === rulesObject[index].field) {
              finalElement[`$${condition}`].push({
                column: rulesObject[index].field,
                comp: rulesObject[index].operator,
                aggregate: column.aggregate,
                value: { plain: rulesObject[index].value },
              });
            }
          });
        } else {
          if (typeof rulesObject[index].value === 'number') {
            finalElement[`$${condition}`].push({
              column: getColumnFromAlias(rulesObject[index].field, columns as AdvancedQueryColumn[])
                .name,
              comp: rulesObject[index].operator,
              value: { plain: rulesObject[index].value },
            });
          } else {
            const receivedString = rulesObject[index].value.split(',');
            finalElement[`$${condition}`].push({
              column: rulesObject[index].field,
              comp: rulesObject[index].operator,
              value: { column: receivedString[0], aggregate: receivedString[1] },
            });
          }
        }
      }
    }
  }

  return finalElement;
};

export const parseHavingQuery = (
  finalElement: any,
  condition: string,
  rulesObject: any,
  aggregateColumns?: AdvancedQueryColumn[],
  columns?: AdvancedQueryColumn[],
): AdvancedQueryHaving => {
  if (rulesObject.hasOwnProperty('condition')) {
    finalElement[`$${rulesObject.condition.toLowerCase()}`] = [];
    finalElement = parseHavingQuery(
      finalElement,
      rulesObject.condition,
      rulesObject.rules,
      aggregateColumns,
      columns,
    );
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].condition) {
        finalElement[`$${condition.toLowerCase()}`].push(
          parseHavingQuery(
            {},
            rulesObject[index].condition,
            rulesObject[index].rules,
            aggregateColumns,
            columns,
          ),
        );
      } else {
        if (!finalElement.hasOwnProperty(`$${condition.toLowerCase()}`)) {
          finalElement[`$${condition.toLowerCase()}`] = [];
        }
        if ((aggregateColumns as AdvancedQueryColumn[]).length > 0) {
          aggregateColumns?.map((column) => {
            if (column.name === rulesObject[index].field) {
              finalElement[`$${condition.toLowerCase()}`].push({
                column: rulesObject[index].field,
                comp: convertJqOperatorToDDW(rulesObject[index].operator),
                aggregate: column.aggregate,
                value: { plain: rulesObject[index].value },
              });
            }
          });
        } else {
          if (typeof rulesObject[index].value === 'number') {
            finalElement[`$${condition.toLowerCase()}`].push({
              column: getColumnFromAlias(rulesObject[index].field, columns as AdvancedQueryColumn[])
                .name,
              comp: convertJqOperatorToDDW(rulesObject[index].operator),
              value: { plain: rulesObject[index].value },
            });
          } else {
            const receivedString = rulesObject[index].value.split(',');
            finalElement[`$${condition.toLowerCase()}`].push({
              column: rulesObject[index].field,
              comp: convertJqOperatorToDDW(rulesObject[index].operator),
              value: { column: receivedString[0], aggregate: receivedString[1] },
            });
          }
        }
      }
    }
  }

  return finalElement;
};

export const createQueryBuilderRules = (finalElement: any, query: any) => {
  if (query && query.hasOwnProperty('$or')) {
    finalElement['combinator'] = 'or';
    finalElement['rules'] = [];
    finalElement = createQueryBuilderRules(finalElement, query.$or);
  } else if (query && query.hasOwnProperty('$and')) {
    finalElement['combinator'] = 'and';
    finalElement['rules'] = [];
    finalElement = createQueryBuilderRules(finalElement, query.$and);
  } else {
    if (query) {
      for (let index = 0; index < query.length; index++) {
        if (query[index].$or) {
          finalElement['rules'].push(createQueryBuilderRules({}, query[index]));
        } else if (query[index].$and) {
          finalElement['rules'].push(createQueryBuilderRules({}, query[index]));
        } else {
          if (!finalElement.hasOwnProperty('rules')) {
            finalElement['rules'] = [];
          } else {
            console.log(query[index]);
            finalElement['rules'].push({
              id: generateID(),
              field: query[index].column,
              operator: query[index].comp,
              value: `${(query[index].value.column, query[index].value.aggregate)}`,
            });
          }
        }
      }
    }
  }
  console.log(finalElement);

  return finalElement;
};

// query.rules?.map((rule, index: number) => {
//   if (rule.hasOwnProperty('condition')) {
//     getHavingQueryValues(rule as JqueryQueryBuilderHaving);
//   } else {
//     const element = (
//       (query as JqueryQueryBuilderHaving)['rules'] as JqueryQueryBuilderHavingComparator[]
//     )[index];
//     if ('plain' in (element.value as { plain: string | number })) {
//       element.value = (element.value as { plain: string | number })['plain'];
//     } else {
//       const activeValue: { column: string; aggregate: string } = element.value as {
//         column: string;
//         aggregate: string;
//       };
//       element.value = `${activeValue?.column},${activeValue.aggregate}`;
//     }
//   }
