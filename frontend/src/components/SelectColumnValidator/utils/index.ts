interface ParsedOption {
  id: string;
  values: any[];
}

type ParsedOptions = ParsedOption | undefined;

export const validateSelectColumnDeselect = (
  options: string,
  checkboxValue: string,
): Promise<string> => {
  return new Promise((resolve: (validationMessage: string) => void) => {
    const parsedOptions = parseOptions(options);
    const validationMessage = (columnName: string, queryName: string) =>
      `Notice that ${columnName
        .split('_')
        .join(' ')} is used in a ${queryName} step, deselecting it here may break this query.`;

    parsedOptions?.values?.flat().reduce(function (result, query) {
      if (query && query.field === checkboxValue && parsedOptions.id === 'filters') {
        resolve(validationMessage(query.field, 'filter'));
      }
      if (query && query.operational_column === checkboxValue && parsedOptions.id === 'aggregate') {
        resolve(validationMessage(query.operational_column, 'aggregate'));
      }
      if (parsedOptions.id === 'join_on') {
        const keys = Object.keys(query.join_on);
        for (const iterator of keys) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(iterator, 'join'));
            break;
          }
        }
      }
      if (query && query.operational_column === checkboxValue && parsedOptions.id === 'scalar') {
        resolve(validationMessage(query.operational_column, 'scalar'));
      }
      if (query && query.operational_columns && parsedOptions.id === 'multi') {
        for (const iterator of query.operational_columns) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(iterator, 'multi'));
            break;
          }
        }
      }
      if (query && query.over && parsedOptions.id === 'window') {
        for (const iterator of query.columns) {
          if (iterator === checkboxValue) {
            resolve(validationMessage(iterator, 'window'));
            break;
          }
        }
      }

      return result;
    }, []);
  });
};

const parseOptions = (options: string): ParsedOptions => {
  const parsedOptions = JSON.parse(options);
  if (parsedOptions.hasOwnProperty('filters')) {
    return { id: 'filters', values: [parsedOptions.filters] };
  }
  if (parsedOptions.hasOwnProperty('join_on')) {
    return { id: 'join_on', values: [parsedOptions] };
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    !parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    return { id: 'aggregate', values: [parsedOptions] };
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    return { id: 'scalar', values: [parsedOptions] };
  }
  if (parsedOptions.hasOwnProperty('operational_columns')) {
    return { id: 'multi', values: [parsedOptions] };
  }
  if (parsedOptions.hasOwnProperty('over')) {
    return { id: 'window', values: [parsedOptions] };
  }
};
