import Tokenizr from 'tokenizr';
import { Set } from 'immutable';

export const parseAdvancedQueryString = (options: string, columns: Set<string>): any => {
  const advancedFilters: any = [];
  let filters: any = [];
  let expression: any = {};
  let operators: any = [];
  let andOR = '';
  let parenthesis = '';
  let bracketFilters: any = [];
  let parenthesisType = '';
  const columnValidation: any = {};

  const isColumnValid = validateTableColumn('region_c', columns);
  console.log(`isColumnValid ${isColumnValid}`);

  const lexer = new Tokenizr();

  //Match table columns with 'x_' prefix
  lexer.rule(/\bx_[a-zA-Z_][a-zA-Z0-9_]*/, (ctx) => {
    ctx.accept('table_column');
  });

  //Match sql comparison operators
  lexer.rule(/(=|>|<|>=|<|<=|<>)/, (ctx) => {
    ctx.accept('operato');
  });

  //Match column value in quotes
  lexer.rule(/(["'])(?:(?=(\\?))\2.)*?\1/, (ctx) => {
    ctx.accept('column_value');
  });

  //Match AND-OR statements
  lexer.rule(/AND|OR/, (ctx) => {
    ctx.accept('AND|OR');
  });

  //Ignore newlines
  lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx) => {
    ctx.ignore();
  });

  //Ignore tabs
  lexer.rule(/[ \t\r\n]+/, (ctx) => {
    ctx.ignore();
  });

  //Match brackets
  lexer.rule(/./, (ctx) => {
    ctx.accept('char');
  });

  lexer.input(options);

  //Create JSON fields from advanced users query string
  lexer.tokens().forEach((token) => {
    // console.log(`token ${JSON.stringify(token)}`);
    if (token.type === 'AND|OR') {
      andOR = token.value;
    }

    if (token.type === 'char' && token.value === '(') {
      parenthesisType = andOR;
      andOR = '';
      parenthesis = token.value;
    } else if (token.type === 'char') {
      parenthesis = token.value;
      parenthesisType = parenthesisType.length === 0 ? andOR : parenthesisType;
    }

    if (token.type === 'table_column') {
      expression = {};
      const tableColumn = token.value.startsWith('x_') ? token.value.substr(2) : token.value;
      expression['field'] = tableColumn;

      if (validateTableColumn(tableColumn, columns) === undefined) {
        columnValidation[tableColumn] = tableColumn;
      }
    } else if (token.type === 'operato') {
      operators.push(token.value);
      expression['func'] = token.value;
    } else if (token.type === 'column_value') {
      expression['value'] = token.value.toString();

      if (operators.length === 2) {
        const expressionOne = { ...expression, func: operators[0] };
        const expressionTwo = { ...expression, func: operators[1] };

        filters.push(expressionOne);
        filters.push(expressionTwo);
      } else {
        filters.push(expression);
      }

      operators = [];

      if (parenthesis === '(' && andOR === 'OR') {
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push(filters[index]);
        }
        filters = [];
      } else if (parenthesis === '(' && andOR === 'AND') {
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push([filters[index]]);
        }

        filters = [];
      } else if (andOR === 'AND') {
        for (let index = 0; index < filters.length; index++) {
          advancedFilters.push([filters[index]]);
        }
        filters = [];
      } else if (andOR === 'OR') {
        for (let index = 0; index < filters.length; index++) {
          advancedFilters.push(filters[index]);
        }
        filters = [];
      }
    }

    if (parenthesis === ')' && parenthesisType === 'AND') {
      if (bracketFilters.length > 0) {
        advancedFilters.push({
          and_brackets: bracketFilters,
        });
      }
      bracketFilters = [];
    } else if (parenthesis === ')' && parenthesisType === 'OR') {
      if (bracketFilters.length > 0) {
        advancedFilters.push({
          or_brackets: bracketFilters,
        });
      }

      bracketFilters = [];
    }
  });

  return {
    filterJSON: advancedFilters,
    validation: Object.keys(columnValidation).join(', '),
  };
};

const validateTableColumn = (columnName: string, columns: Set<string>) => {
  return columns.find((col) => col === columnName);
};
