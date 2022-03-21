import { RuleGroupType } from 'react-querybuilder';
import { ValidationResponse } from '.';
import { AdvancedQueryFilter } from '../../../types/operations';

export const handleAnd = (validationResponse: ValidationResponse): void => {
  console.log(validationResponse);
};

export const operations = [
  { key: '$lt', text: 'is Less Than', value: '$lt' },
  { key: '$le', text: 'is Less Than Or Equal', value: '$lte' },
  { key: '$eq', text: 'is Equal', value: '$eq' },
  { key: '$neq', text: 'is Not Equal', value: '$neq' },
  { key: '$gt', text: 'is Greater Than', value: '$gt' },
  { key: '$ge', text: 'is Greater Than Or Equal', value: '$gte' },
];

export const parseQuery = (
  finalElement: any,
  condition: string,
  rulesObject: any,
): AdvancedQueryFilter => {
  if (rulesObject.hasOwnProperty('combinator')) {
    finalElement[`$${rulesObject.combinator}`] = [];
    finalElement = parseQuery(finalElement, rulesObject.combinator, rulesObject.rules);
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].combinator) {
        finalElement[`$${condition}`].push(
          parseQuery({}, rulesObject[index].combinator, rulesObject[index].rules),
        );
      } else {
        if (!finalElement.hasOwnProperty(`$${condition}`)) {
          finalElement[`$${condition}`] = [];
        }
        finalElement[`$${condition}`].push({
          column: rulesObject[index].field,
          comp: rulesObject[index].operator,
          value: rulesObject[index].value,
        });
      }
    }
  }

  return finalElement;
};
