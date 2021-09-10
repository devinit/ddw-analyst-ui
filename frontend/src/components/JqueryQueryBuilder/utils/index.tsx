export const parseQuery = (finalElement: any, condition: string, rulesObject: any) => {
  if (rulesObject.hasOwnProperty('condition')) {
    finalElement[rulesObject.condition] = [];
    finalElement = parseQuery(finalElement, rulesObject.condition, rulesObject.rules);
  } else {
    for (let index = 0; index < rulesObject.length; index++) {
      if (Array.isArray(rulesObject) && rulesObject[index].condition) {
        finalElement[condition].push(
          parseQuery({}, rulesObject[index].condition, rulesObject[index].rules),
        );
      } else {
        if (finalElement.hasOwnProperty(condition)) {
          finalElement[condition].push(rulesObject[index]);
        } else {
          finalElement[condition] = [];
          finalElement[condition].push(rulesObject[index]);
        }
      }
    }
  }

  return finalElement;
};
