import { QueryBuilderRules } from '..';

export const parseQueryBuilderRules = (queryRules: any, current: any, condition: string) => {
  const rules = [];
  for (let index = 0; index < queryRules?.length; index++) {
    const element = queryRules[index];

    if (element.hasOwnProperty('condition')) {
      const rules = parseQueryBuilderRules(element.rules, current, element.condition);
      current = { ...current, [`${condition}`]: rules };
    } else {
      rules.push(element);
    }
  }

  return current;
};
