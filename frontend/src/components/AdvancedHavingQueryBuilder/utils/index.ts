import { AdvancedQueryColumn } from '../../../types/operations';

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
): AdvancedQueryColumn => {
  console.log(columns, alias);

  return columns.find((col) => col.alias === alias) as AdvancedQueryColumn;
};
