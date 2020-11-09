import { List, Set, fromJS } from 'immutable';
import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropdownItemProps } from 'semantic-ui-react';
import { queryBuilderReducerId } from '../../pages/QueryBuilder/reducers';
import { ReduxStore } from '../../store';
import { Filters, OperationStepMap, WindowOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';
import { AggregateQueryBuilder } from '../AggregateQueryBuilder';
import { BasicTextarea } from '../BasicTextarea';
import FilterQueryBuilder from '../FilterQueryBuilder';
import { JoinQueryBuilder } from '../JoinQueryBuilder';
import { SelectQueryBuilder } from '../SelectQueryBuilder';
import { TransformQueryBuilder } from '../TransformQueryBuilder';
import { WindowQueryBuilder } from '../WindowQueryBuilder';
import Tokenizr from 'tokenizr';

interface ComponentProps {
  alerts?: { [key: string]: string };
  source: SourceMap;
  step: OperationStepMap;
  editable?: boolean;
  onUpdateOptions: (options: string) => void;
}

interface ReduxState {
  steps: List<OperationStepMap>;
}
type QueryBuilderHandlerProps = ComponentProps & ReduxState;

class QueryBuilderHandler extends React.Component<QueryBuilderHandlerProps> {
  static getSelectOptionsFromColumns(
    columns: Set<string>,
    columnList: ColumnList,
  ): DropdownItemProps[] {
    if (columns.count()) {
      return columns.toArray().map((column, key) => ({
        key,
        text: QueryBuilderHandler.getColumnAlias(column, columnList),
        value: column,
      }));
    }

    return [];
  }

  static isNumerical(functn: string): boolean {
    const nonNumericalFunctions = [
      'text_search',
      'concat',
      'FirstValue',
      'LastValue',
      'Rank',
      'DenseRank',
      'RowNumber',
    ];

    return !nonNumericalFunctions.includes(functn);
  }

  static getSelectOptionsFromFilteredColumns(
    columnsList: ColumnList,
    columns: Set<string>,
    functn?: string,
  ): DropdownItemProps[] {
    //tslint:disable-line
    const dataSetColumns = columnsList.filter((column) =>
      columns.find((col) => col === column.get('name')),
    );
    const generatedColumns = columns.subtract(
      Set(dataSetColumns.map((column) => column.get('name'))) as Set<string>,
    );
    let selectableColumns = generatedColumns;
    if (dataSetColumns.count()) {
      if (functn) {
        const dataType: 'N' | 'C' = this.isNumerical(functn) ? 'N' : 'C';
        selectableColumns = selectableColumns.union(
          dataSetColumns
            .filter((column) => column.get('data_type') === dataType)
            .map((column) => column.get('name')) as List<string>,
        );
      } else {
        selectableColumns = selectableColumns.union(
          dataSetColumns.map((column) => column.get('name')),
        ) as Set<string>;
      }
    }

    return selectableColumns
      .map((column, key) => ({
        key,
        text: QueryBuilderHandler.getColumnAlias(column, columnsList),
        value: column,
      }))
      .toJS();
  }

  static getColumnAlias(columnName: string, columns: ColumnList): string {
    const matching = columns.find((column) => column.get('name') === columnName);

    return (matching && (matching.get('alias') as string)) || formatString(columnName);
  }

  render() {
    try {
      return this.renderQueryBuilder();
    } catch (error) {
      if (error.message && error.message.indexOf('JSON')) {
        return (
          <Alert variant="warning">
            Invalid JSON in step options. Delete and recreate the step.
          </Alert>
        );
      }
      console.log(error); //tslint:disable-line

      return (
        <Alert variant="warning">
          Failed to process step options. Delete and recreate the step.
        </Alert>
      );
    }
  }

  renderQueryBuilder() {
    const { alerts, onUpdateOptions, step, steps, source } = this.props;
    const query = step.get('query_func');
    const options = step.get('query_kwargs') as string;

    if (query === 'filter') {
      const { filters }: Filters = options ? JSON.parse(options) : { filters: [] };

      return (
        <FilterQueryBuilder
          source={source}
          filters={fromJS(filters)}
          step={step}
          steps={steps}
          onUpdateFilters={onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }
    if (query === 'advanced') {
      const onTextareaChange = (options: string) => {
        const advancedFilters: any = [];
        let filters: any = [];
        let expression: any = {};
        let operators: any = [];
        let andOR = '';
        let parenthesis = '';
        let bracketFilters: any = [];
        let parenthesisType = '';

        const lexer = new Tokenizr();

        lexer.rule(/\bx_[a-zA-Z_][a-zA-Z0-9_]*/, (ctx) => {
          ctx.accept('table_column');
        });
        lexer.rule(/(=|>|<|>=|<|<=|<>)/, (ctx) => {
          ctx.accept('operato');
        });
        lexer.rule(/(["'])(?:(?=(\\?))\2.)*?\1/, (ctx) => {
          ctx.accept('column_value');
        });
        lexer.rule(/AND|OR/, (ctx) => {
          ctx.accept('AND|OR');
        });
        lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx) => {
          ctx.ignore();
        });
        lexer.rule(/[ \t\r\n]+/, (ctx) => {
          ctx.ignore();
        });
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
            console.log(JSON.stringify(advancedFilters));
          }
        });
        onUpdateOptions(options);
      };

      return <BasicTextarea onChange={onTextareaChange} />;
    }
    if (query === 'select') {
      const { columns } = options ? JSON.parse(options) : { columns: [] }; // TODO: specify type

      return (
        <SelectQueryBuilder
          source={source}
          columns={columns}
          step={step}
          steps={steps}
          onUpdateColumns={this.props.onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }
    if (query === 'aggregate') {
      const parsedOptions = options
        ? JSON.parse(options)
        : { group_by: [], agg_func_name: '', operational_column: '' };

      return (
        <AggregateQueryBuilder
          alerts={alerts}
          source={source}
          groupBy={parsedOptions.group_by}
          function={parsedOptions.agg_func_name}
          column={parsedOptions.operational_column}
          step={step}
          steps={steps}
          onUpdate={onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }
    if (query === 'scalar_transform' || query === 'multi_transform') {
      const parsedOptions = options
        ? JSON.parse(options)
        : {
            operational_value: '',
            trans_func_name: '',
            operational_column: '',
            operational_columns: [],
          };

      return (
        <TransformQueryBuilder
          alerts={alerts}
          source={source}
          value={parsedOptions.operational_value}
          function={parsedOptions.trans_func_name}
          column={parsedOptions.operational_column}
          columns={parsedOptions.operational_columns}
          step={step}
          steps={steps}
          multi={query === 'multi_transform'}
          onUpdate={onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }
    if (query === 'join') {
      const parsedOptions = options
        ? JSON.parse(options)
        : {
            table_name: '',
            schema_name: '',
            join_on: {},
            columns_x: [],
            columns_y: [],
            join_how: '',
          };
      const columns = source.get('columns') as ColumnList;

      return (
        <JoinQueryBuilder
          alerts={alerts}
          source={source}
          tableName={parsedOptions.table_name}
          schema={parsedOptions.schema_name}
          columnMapping={parsedOptions.join_on}
          columnsX={parsedOptions.columns_x || columns.map((column) => column.get('name'))}
          columnsY={parsedOptions.columns_y || []}
          joinType={parsedOptions.join_how}
          step={step}
          steps={steps}
          onUpdate={onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }

    if (query === 'window') {
      const parsedOptions: WindowOptions = options
        ? JSON.parse(options)
        : { window_fn: '', order_by: [], term: '', over: [], columns: [] };

      return (
        <WindowQueryBuilder
          alerts={alerts}
          source={source}
          function={parsedOptions.window_fn}
          columns={parsedOptions.columns}
          orderBy={parsedOptions.order_by}
          over={parsedOptions.over}
          term={parsedOptions.term}
          step={step}
          steps={steps}
          onUpdate={onUpdateOptions}
          editable={this.props.editable}
        />
      );
    }

    return null;
  }
}

const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  steps: reduxStore.getIn([`${queryBuilderReducerId}`, 'steps']) as List<OperationStepMap>,
});

const connector = connect(mapStateToProps)(QueryBuilderHandler);

export {
  connector as default,
  connector as QueryBuilderHandler,
  QueryBuilderHandler as QueryBuilderHandlerStatic,
};
