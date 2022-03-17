import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
} from '../../types/operations';
import { Column, ColumnList, SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { createQueryBuilderRules } from '../JqueryQueryBuilder/utils';
import { Field, NameLabelPair, RuleGroupType } from 'react-querybuilder';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import {
  getAggregateColumns,
  getGroupByColumns,
  getHavingQueryValues,
  hasAggregate,
  hasNumericColumns,
  isNumeric,
  parseHavingQuery,
  parseHavingQueryReact,
} from './utils';
import { ReactQueryBuilder } from '../ReactQueryBuilder';

interface ComponentProps {
  source: SourceMap;
}
export const aggregateOptions = ['AVG', 'SUM', 'MAX', 'MIN', 'STD'];

const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});
  const [error, setError] = useState('');
  const operators = [
    { name: '$eq', label: '=' },
    { name: '$neq', label: '!=' },
    { name: '$lt', label: '<' },
    { name: '$gt', label: '>' },
    { name: '$le', label: '<=' },
    { name: '$gte', label: '>=' },
  ];

  // useEffect(() => {

  // });

  // const getDropdownOptionsForAggregateColumn = (
  //   aggregateOptions: string[],
  //   column: AdvancedQueryColumn,
  // ): DropdownItemProps[] =>
  //   aggregateOptions.map((option) => ({
  //     value: `${column.name},${option}`,
  //     label: `${option}(${column.alias})`,
  //   }));

  const getDropdownOptionsForAggregateColumn = (
    aggregateOptions: string[],
    column: AdvancedQueryColumn,
  ): NameLabelPair[] =>
    aggregateOptions.map((option) => ({
      name: `${column.name},${option}`,
      label: `${option}(${column.alias})`,
    }));

  // const fieldData = () => {
  //   const data: any[] = [];
  //   const columns = getGroupByColumns(options).concat(getAggregateColumns(options.columns));
  //   columns.map((column) => {
  //     if (column.aggregate) {
  //       data.push({
  //         id: column.name as string,
  //         label: `${column.aggregate}(${column.alias as string})`,
  //         type: 'string',
  //         operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
  //       });
  //     } else if (
  //       isNumeric((source.get('columns') as ColumnList).toJS() as Column[], column) &&
  //       !column.aggregate
  //     ) {
  //       data.push({
  //         id: column.name as string,
  //         label: `${column.alias as string}(aggregate value)`,
  //         type: 'string',
  //         input: 'select',
  //         values: getDropdownOptionsForAggregateColumn(aggregateOptions, column),
  //         operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
  //       });
  //     }
  //   });

  //   return data;
  // };

  const fields = () => {
    const data: Field[] = [];
    const columns = getGroupByColumns(options).concat(getAggregateColumns(options.columns));
    columns.map((column) => {
      if (column.aggregate) {
        data.push({
          name: column.name as string,
          label: `${column.aggregate}(${column.alias as string})`,
          operators,
        });
      } else if (
        isNumeric((source.get('columns') as ColumnList).toJS() as Column[], column) &&
        !column.aggregate
      ) {
        data.push({
          name: column.name as string,
          label: `${column.alias as string}(aggregate value)`,
          operators,
          valueEditorType: 'select',
          values: getDropdownOptionsForAggregateColumn(aggregateOptions, column),
        });
      }
    });

    return data;
  };

  // const getJqueryBuilderInstance = (jqInstance: any) => {
  //   setJqBuilder(jqInstance);
  // };

  // const onReplace = () => {
  //   const rules = jqBuilder?.getRules();
  // const aggregateColumns = getAggregateColumns(options.columns);
  // const columns = getGroupByColumns(options);
  //   options.having = parseHavingQuery(
  //     {},
  //     rules.condition,
  //     rules,
  //     aggregateColumns,
  //     columns,
  //   ) as AdvancedQueryHaving;
  //   if (updateOptions) {
  //     updateOptions(options as AdvancedQueryOptions);
  //   }
  // };

  // const onReset = () => {
  //   jqBuilder?.reset();
  // };

  // if (
  //   hasNumericColumns(source.get('columns') as ColumnList, options) ||
  //   hasAggregate(options.columns)
  // ) {
  //   return (
  //     <>
  //       <JqueryQueryBuilder
  //         fieldData={fieldData()}
  //         getJqueryBuilderInstance={getJqueryBuilderInstance}
  //         icons={{
  //           add_group: 'fa fa-plus-circle',
  //           add_rule: 'fa fa-plus',
  //           remove_group: 'fa fa-times realign',
  //           remove_rule: 'fa fa-times realign',
  //           error: 'fa fa-exclamation-triangle',
  //         }}
  //         rules={createQueryBuilderRules({}, options.having)}
  //         getHavingQueryValues={getHavingQueryValues}
  //       />
  //       <ButtonGroup className="mr-2">
  //         <Button
  //           variant="danger"
  //           size="sm"
  //           data-toggle="tooltip"
  //           data-placement="bottom"
  //           data-html="true"
  //           title={`<i>Replaces</i> existing filter config`}
  //           onClick={() => onReplace()}
  //         >
  //           Add
  //         </Button>
  //         <Button
  //           variant="dark"
  //           size="sm"
  //           data-toggle="tooltip"
  //           data-placement="bottom"
  //           data-html="true"
  //           title={`<i>Resets</i> config to default JSON`}
  //           onClick={onReset}
  //         >
  //           Reset
  //         </Button>
  //       </ButtonGroup>
  //     </>
  //   );
  // }

  const onQueryChange = (query: RuleGroupType) => {
    console.log(query);
    const aggregateColumns = getAggregateColumns(options.columns);
    const columns = getGroupByColumns(options);
    options.having = parseHavingQueryReact({}, query.combinator, query, aggregateColumns, columns);
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };
  console.log(options.having);

  return (
    <div>
      <Alert variant="warning" show={!!error}>
        {error}
      </Alert>
      <ReactQueryBuilder fields={fields()} onQueryChange={onQueryChange} />
    </div>
  );
};
export { AdvancedHavingQueryBuilder };
