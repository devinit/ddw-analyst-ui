import React, { FunctionComponent, useContext, useState } from 'react';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
} from '../../types/operations';
import { Column, ColumnList, SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { createQueryBuilderRules, parseHavingQuery } from '../JqueryQueryBuilder/utils';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import {
  getAggregateColumns,
  getGroupByColumns,
  getHavingQueryValues,
  hasAggregate,
  hasNumericColumns,
  isNumeric,
} from './utils';

interface ComponentProps {
  source: SourceMap;
}
export const aggregateOptions = ['AVG', 'SUM', 'MAX', 'MIN', 'STD'];
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  const getAggregateValues = (aggregateOptions: string[], column: AdvancedQueryColumn) => {
    const options = aggregateOptions.map((option) => {
      return {
        value: `${column.name},${option}`,
        label: `${option}(${column.alias})`,
      };
    });

    return options;
  };

  const fieldData = () => {
    const data: any[] = [];
    const columns = getGroupByColumns(options).concat(getAggregateColumns(options.columns));
    columns.map((column) => {
      if (column.aggregate) {
        data.push({
          id: column.name as string,
          label: `${column.aggregate}(${column.alias as string})`,
          type: 'string',
          operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
        });
      } else if (
        isNumeric((source.get('columns') as ColumnList).toJS() as Column[], column) &&
        !column.aggregate
      ) {
        data.push({
          id: column.name as string,
          label: `${column.alias as string}(aggregate value)`,
          type: 'string',
          input: 'select',
          values: getAggregateValues(aggregateOptions, column),
          operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
        });
      }
    });

    return data;
  };

  const getJqueryBuilderInstance = (jqInstance: any) => {
    setJqBuilder(jqInstance);
  };

  const onReplace = () => {
    const rules = jqBuilder?.getRules();
    const aggregateColumns = getAggregateColumns(options.columns);
    const columns = getGroupByColumns(options);
    options.having = parseHavingQuery(
      {},
      rules.condition,
      rules,
      aggregateColumns,
      columns,
    ) as AdvancedQueryHaving;
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  const onReset = () => {
    jqBuilder?.reset();
  };

  if (
    hasNumericColumns(source.get('columns') as ColumnList, options) ||
    hasAggregate(options.columns)
  ) {
    return (
      <>
        <JqueryQueryBuilder
          fieldData={fieldData()}
          getJqueryBuilderInstance={getJqueryBuilderInstance}
          icons={{
            add_group: 'fa fa-plus-circle',
            add_rule: 'fa fa-plus',
            remove_group: 'fa fa-times realign',
            remove_rule: 'fa fa-times realign',
            error: 'fa fa-exclamation-triangle',
          }}
          rules={createQueryBuilderRules({}, options.having)}
          getHavingQueryValues={getHavingQueryValues}
        />
        <ButtonGroup className="mr-2">
          <Button
            variant="danger"
            size="sm"
            data-toggle="tooltip"
            data-placement="bottom"
            data-html="true"
            title={`<i>Replaces</i> existing filter config`}
            onClick={() => onReplace()}
          >
            Add
          </Button>
          <Button
            variant="dark"
            size="sm"
            data-toggle="tooltip"
            data-placement="bottom"
            data-html="true"
            title={`<i>Resets</i> config to default JSON`}
            onClick={onReset}
          >
            Reset
          </Button>
        </ButtonGroup>
      </>
    );
  }

  return (
    <Alert variant="warning">Having clause requires numeric columns in the Group By clause</Alert>
  );
};
export { AdvancedHavingQueryBuilder };
