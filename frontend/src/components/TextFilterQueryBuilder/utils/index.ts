import Tokenizr from 'tokenizr';
import { Set } from 'immutable';

type ComparisonOperators = '=' | '>' | '<' | '>=' | '<=' | '!=' | '=>' | '=<';
type StringOperators = 'lt' | 'le' | 'eq' | 'gt' | 'ge' | 'text_search' | 'ne';
export interface TextFilter {
  field?: string;
  value?: string | number;
  func?: StringOperators;
}

export type ComparisonMap = {
  [key in ComparisonOperators]: StringOperators;
};

export interface OrBracket {
  or_brackets: TextFilterArray[];
}

export interface AndBracket {
  and_brackets: TextFilterArray[];
}

export type TextFilterArray = TextFilter[] | TextFilter | OrBracket | AndBracket;

interface ParsedTextFilter {
  filterJSON: TextFilterArray[];
  validation: string;
}

const operatorMap: ComparisonMap = {
  '>=': 'ge',
  '=>': 'ge',
  '<=': 'le',
  '=<': 'le',
  '<': 'lt',
  '>': 'gt',
  '=': 'eq',
  '!=': 'ne',
};

export const parseTextFilterString = (options: string, columns: Set<string>): ParsedTextFilter => {
  const advancedFilters: TextFilterArray[] = [];
  let bracketFilters: TextFilterArray[] = [];
  let operators: ComparisonOperators[] = [];
  let filters: TextFilter[] = [];
  let expression: TextFilter = {};
  let andOR = '';
  let parenthesis = '';
  let parenthesisType = '';
  const columnValidation: { [key: string]: string } = {};

  const lexer = new Tokenizr();

  //Match table columns with 'col_' prefix
  lexer.rule(/\bcol_[a-zA-Z_][a-zA-Z0-9_]*/, (ctx) => {
    ctx.accept('table_column');
  });

  //Match sql comparison operators
  lexer.rule(/(=|>|<|>=|<|<=|!=)/, (ctx) => {
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

  //Create JSON fields from text filters query string
  lexer.tokens().forEach((token) => {
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
      const tableColumn = token.value.startsWith('col_') ? token.value.substr(4) : token.value;
      expression['field'] = tableColumn;

      if (validateTableColumn(tableColumn, columns) === undefined) {
        columnValidation[tableColumn] = tableColumn;
      }
    } else if (token.type === 'operato') {
      operators.push(token.value);
      expression['func'] = token.value;
    } else if (token.type === 'column_value') {
      expression['value'] = removeQuotes(token.value).toString();

      filters.push({ ...expression, func: mapComparisonOperators(operators) });

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
  const col = columns.find((col) => col === columnName);

  return col;
};

export const getTextFilterString = (
  format: string,
  filters: any,
  textFilterString: string,
): string => {
  let openParenthesis = '';
  let closeParenthesis = '';

  for (let index = 0; index < filters.length; index++) {
    const element = filters[index];
    openParenthesis = index === 0 ? '(' : '';
    closeParenthesis = index === filters.length - 1 ? ')' : '';

    if (Array.isArray(element)) {
      const operator = textFilterString.length > 0 ? 'AND' : '';
      if (format === 'or_brackets') {
        const bracketOperator = index === 0 ? 'OR' : 'AND';
        textFilterString = `${textFilterString} ${bracketOperator} ${openParenthesis}col_${
          element[0]['field']
        }${reverseMapComparisonOperators(element[0]['func'])}'${
          element[0]['value']
        }'${closeParenthesis}`;
      } else if (format === 'and_brackets') {
        textFilterString = `${textFilterString} ${operator} ${openParenthesis}col_${
          element[0]['field']
        }${reverseMapComparisonOperators(element[0]['func'])}'${
          element[0]['value']
        }'${closeParenthesis}`;
      } else {
        textFilterString = `${textFilterString} ${operator} col_${
          element[0]['field']
        }${reverseMapComparisonOperators(element[0]['func'])}'${element[0]['value']}'`;
      }
    } else if (typeof element === 'object' && element !== null) {
      const operator = textFilterString.length > 0 ? 'OR' : '';
      if (element.hasOwnProperty('or_brackets')) {
        textFilterString = getTextFilterString(
          'or_brackets',
          element['or_brackets'],
          textFilterString,
        );
      } else if (element.hasOwnProperty('and_brackets')) {
        textFilterString = getTextFilterString(
          'and_brackets',
          element['and_brackets'],
          textFilterString,
        );
      } else {
        if (format === 'or_brackets') {
          textFilterString = `${textFilterString} ${operator} ${openParenthesis}col_${
            element['field']
          }${reverseMapComparisonOperators(element['func'])}'${
            element['value']
          }'${closeParenthesis}`;
        } else if (format === 'and_brackets') {
          const bracketOperator = index === 0 ? 'AND' : 'OR';
          textFilterString = `${textFilterString} ${bracketOperator} ${openParenthesis}col_${
            element['field']
          }${reverseMapComparisonOperators(element['func'])}'${
            element['value']
          }'${closeParenthesis}`;
        } else {
          textFilterString = `${textFilterString} ${operator} col_${
            element['field']
          }${reverseMapComparisonOperators(element['func'])}'${element['value']}'`;
        }
      }
    }
  }

  return textFilterString;
};

const mapComparisonOperators = (operators: ComparisonOperators[]): StringOperators => {
  return operatorMap[operators.join('') as ComparisonOperators];
};

export const reverseMapComparisonOperators = (operator: string | undefined): string | undefined => {
  for (const key in operatorMap) {
    if (operatorMap[key as ComparisonOperators] === operator) {
      return key;
    }
  }
};

const removeQuotes = (str: string) => {
  return str.replace(/['"]+/g, '');
};
