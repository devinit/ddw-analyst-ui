import { generateID, RuleGroupType } from 'react-querybuilder';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
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

export const parseHavingQuery = (
  finalElement: any,
  condition: string,
  rulesObject: any,
  aggregateColumns: AdvancedQueryColumn[],
): AdvancedQueryHaving => {
  if (rulesObject.hasOwnProperty('combinator')) {
    finalElement[`$${rulesObject.combinator}`] = [];
    finalElement = parseHavingQuery(
      finalElement,
      rulesObject.combinator,
      rulesObject.rules,
      aggregateColumns,
    );
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].combinator) {
        finalElement[`$${condition}`].push(
          parseHavingQuery(
            {},
            rulesObject[index].combinator,
            rulesObject[index].rules,
            aggregateColumns,
          ),
        );
      } else {
        if (!finalElement.hasOwnProperty(`$${condition}`)) {
          finalElement[`$${condition}`] = [];
        }
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
      }
    }
  }

  return finalElement;
};

export const createQueryBuilderRules = (finalElement: any, query: any): RuleGroupType => {
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
            if ('aggregate' in query[index]) {
              finalElement['rules'].push({
                id: generateID(),
                field: query[index].column,
                operator: query[index].comp,
                value: query[index].value['plain'],
              });
            } else {
              finalElement['rules'].push({
                id: generateID(),
                field: query[index].column,
                operator: query[index].comp,
                value: `${query[index].value.column},${query[index].value.aggregate}`,
              });
            }
          }
        }
      }
    }
  }

  return finalElement;
};
