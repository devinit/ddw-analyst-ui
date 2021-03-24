interface ParsedOptions {
  id: string;
  values: any[];
}

export const validateSelectColumnDeselect = (options: string, checkboxValue: string) => {
  return new Promise((resolve: (validationMessage: string) => void) => {
    const parsedOptions = parseOptions(options);
    parsedOptions?.values?.flat().reduce(function (result, query) {
      if (query && query.field === checkboxValue && parsedOptions.id === 'filters') {
        resolve(
          `Notice that ${query.field
            .split('_')
            .join(' ')} is used in a filter step, deselecting it here may break this query.`,
        );
      }
      if (
        query &&
        query.operational_column === checkboxValue.substr(0, checkboxValue.lastIndexOf('_')) &&
        parsedOptions.id === 'aggregate'
      ) {
        resolve(
          `Notice that ${query.operational_column
            .split('_')
            .join(' ')} is used in an aggregate step, deselecting it here may break this query.`,
        );
      }
      if (parsedOptions.id === 'join_on') {
        const keys = Object.keys(query.join_on);
        for (const iterator of keys) {
          if (iterator === checkboxValue) {
            resolve(
              `Notice that ${iterator
                .split('_')
                .join(' ')} is used in a join step, deselecting it here may break this query.`,
            );
            break;
          }
        }
      }
      if (query && query.operational_column === checkboxValue && parsedOptions.id === 'scalar') {
        resolve(
          `Notice that ${query.operational_column
            .split('_')
            .join(
              ' ',
            )} is used in a scalar transform step, deselecting it here may break this query.`,
        );
      }
      if (query && query.operational_columns && parsedOptions.id === 'multi') {
        for (const iterator of query.operational_columns) {
          if (iterator === checkboxValue) {
            resolve(
              `Notice that ${iterator
                .split('_')
                .join(
                  ' ',
                )} is used in a multi transform step, deselecting it here may break this query.`,
            );
            break;
          }
        }
      }
      if (query && query.over && parsedOptions.id === 'window') {
        for (const iterator of query.columns) {
          if (iterator === checkboxValue) {
            resolve(
              `Notice that ${iterator
                .split('_')
                .join(' ')} is used in a window step, deselecting it here may break this query.`,
            );
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
  let id = '';
  let values = [parsedOptions];
  if (parsedOptions.hasOwnProperty('filters')) {
    id = 'filters';
    values = [parsedOptions.filters];
  }
  if (parsedOptions.hasOwnProperty('join_on')) {
    id = 'join_on';
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    !parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    id = 'aggregate';
  }
  if (
    parsedOptions.hasOwnProperty('operational_column') &&
    parsedOptions.hasOwnProperty('trans_func_name')
  ) {
    id = 'scalar';
  }
  if (parsedOptions.hasOwnProperty('operational_columns')) {
    id = 'multi';
  }
  if (parsedOptions.hasOwnProperty('over')) {
    id = 'window';
  }

  return {
    id,
    values,
  };
};
