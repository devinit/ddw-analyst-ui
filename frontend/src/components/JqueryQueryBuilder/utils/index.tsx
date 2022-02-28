import {
  AdvancedQueryColumn,
  AdvancedQueryFilter,
  AdvancedQueryHaving,
  FilterComp,
  JqueryQueryBuilderComps,
  JqueryQueryBuilderFilter,
} from '../../../types/operations';

export const parseQuery = (
  finalElement: any,
  condition: string,
  rulesObject: any,
): AdvancedQueryFilter => {
  if (rulesObject.hasOwnProperty('condition')) {
    finalElement[`$${rulesObject.condition.toLowerCase()}`] = [];
    finalElement = parseQuery(finalElement, rulesObject.condition, rulesObject.rules);
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].condition) {
        finalElement[`$${condition.toLowerCase()}`].push(
          parseQuery({}, rulesObject[index].condition, rulesObject[index].rules),
        );
      } else {
        if (!finalElement.hasOwnProperty(`$${condition.toLowerCase()}`)) {
          finalElement[`$${condition.toLowerCase()}`] = [];
        }
        finalElement[`$${condition.toLowerCase()}`].push({
          column: rulesObject[index].field,
          comp: convertJqOperatorToDDW(rulesObject[index].operator),
          value: rulesObject[index].value,
        });
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
): AdvancedQueryHaving => {
  if (rulesObject.hasOwnProperty('condition')) {
    finalElement[`$${rulesObject.condition.toLowerCase()}`] = [];
    finalElement = parseHavingQuery(
      finalElement,
      rulesObject.condition,
      rulesObject.rules,
      aggregateColumns,
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

  return finalElement;
};

export const createQueryBuilderRules = (
  finalElement: any,
  query: any,
): JqueryQueryBuilderFilter => {
  if (query && query.hasOwnProperty('$or')) {
    finalElement['condition'] = 'OR';
    finalElement['rules'] = [];
    finalElement = createQueryBuilderRules(finalElement, query.$or);
  } else if (query && query.hasOwnProperty('$and')) {
    finalElement['condition'] = 'AND';
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
          }
          finalElement['rules'].push({
            id: query[index].column,
            field: query[index].column,
            type: 'string',
            input: 'text',
            operator: convertDDWOperatorToJq(query[index].comp),
            value: query[index].value,
          });
        }
      }
    }
  }

  return finalElement;
};

const convertDDWOperatorToJq = (ddwOperator: FilterComp) => {
  const operatorMap = {
    $eq: 'equal',
    $neq: 'not_equal',
    $lt: 'less',
    $le: 'less_or_equal',
    $gt: 'greater',
    $gte: 'greater_or_equal',
    $btn: 'between',
    $in: 'in',
    $text_search: 'contains',
  };

  return operatorMap[ddwOperator];
};

const convertJqOperatorToDDW = (operator: JqueryQueryBuilderComps) => {
  const operatorMap = {
    equal: '$eq',
    not_equal: '$neq',
    less: '$lt',
    less_or_equal: '$le',
    greater: '$gt',
    greater_or_equal: '$gte',
    between: '$btn',
    in: '$in',
    contains: '$text_search',
  };

  return operatorMap[operator];
};
