import {
  AdvancedQueryFilter,
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
  };

  return operatorMap[operator];
};
