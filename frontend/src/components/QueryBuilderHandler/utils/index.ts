import Tokenizr from 'tokenizr';

export const parseAdvancedQueryString = (options: string): any => {
  const advancedFilters: any = [];
  let filters: any = [];
  let expression: any = {};
  let operators: any = [];
  let andOR = '';
  let parenthesis = '';
  let bracketFilters: any = [];
  let parenthesisType = '';

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
      expression['field'] = token.value;
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

      // console.log(`Parenthesis ${parenthesis}`);
      if (parenthesis === '(' && andOR === 'OR') {
        // console.log(`Open Or parenthesis ${parenthesis}`);
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push(filters[index]);
        }
        filters = [];
      } else if (parenthesis === '(' && andOR === 'AND') {
        // console.log(`Open AND parenthesis ${parenthesis}`);
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push([filters[index]]);
        }
        // console.log(`filters ${JSON.stringify(filters)}`);
        // console.log(`bracketFilters ${JSON.stringify(bracketFilters)}`);
        // console.log(`Parenthesis type ${parenthesisType}`);
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
      // console.log(`bracketFilters ${JSON.stringify(bracketFilters)}`);
      if (bracketFilters.length > 0) {
        advancedFilters.push({
          or_brackets: bracketFilters,
        });
      }
      // console.log(`Full full ${JSON.stringify(advancedFilters)}`);
      bracketFilters = [];
    }

    if (token.type === 'EOF') {
      // console.log(JSON.stringify(advancedFilters));
    }
  });

  return advancedFilters;
};
