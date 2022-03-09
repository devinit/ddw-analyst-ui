const fieldClasses = 'form-control col-3 border-top border-left border-right rounded';
const operatorClasses =
  'form-control col-2 text-center border-top border-left border-right rounded';
const combinatorClasses =
  'form-control col-1 text-center border-top border-left border-right rounded';

export const getClasses = (defaultClasses: Record<string, unknown>): Record<string, unknown> => {
  return {
    ...defaultClasses,
    fields: `${defaultClasses.fields} ${fieldClasses}`,
    operators: `${defaultClasses.operators} ${operatorClasses}`,
    value: `${defaultClasses.value} col-3`,
    combinators: `${defaultClasses.combinators} ${combinatorClasses}`,
  };
};
