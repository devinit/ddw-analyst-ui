import { Classnames } from 'react-querybuilder';

export const getClasses = (defaultClasses: Partial<Classnames>): Partial<Classnames> => {
  return {
    ...defaultClasses,
    value: `${defaultClasses.value} col-3`,
  };
};
