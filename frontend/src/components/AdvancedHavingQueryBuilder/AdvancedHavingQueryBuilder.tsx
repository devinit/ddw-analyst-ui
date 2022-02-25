import React, { FunctionComponent, useContext, useState } from 'react';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
  JqueryQueryBuilderFieldData,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { createQueryBuilderRules, parseHavingQuery } from '../JqueryQueryBuilder/utils';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
}
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  const getGroupColumns = () =>
    options.columns?.filter((col) => options.groupby?.includes(col.name as string));

  const getAggregateColumns = () => options.columns?.filter((column) => column.aggregate);

  const getColumns = () => {
    const groupColumns = getGroupColumns();
    const aggregateColumns = getAggregateColumns();

    return groupColumns?.concat(aggregateColumns as AdvancedQueryColumn);
  };
  const aggregateOptions = ['SUM', 'AVG', 'MAX', 'MIN', 'STD'];
  const getAggregateValues = (aggregateOptions: string[], columnName: string) => {
    const options = aggregateOptions.map((option) => {
      return {
        value: { column: columnName, aggregate: option },
        label: `${option}(${columnName})`,
      };
    });

    return options;
  };

  const fieldData = () => {
    const data: any[] = [];
    (getColumns() as AdvancedQueryColumn[])?.map((column) => {
      if (column.aggregate) {
        // {
        //   id: column.name as string,
        //   label: column.alias as string,
        //   type: 'string',
        //   operators: ['equal', 'less', 'greater'],
        //   input: 'select',
        //   values: getAggregateValues(aggregateOptions, column.name as string),
        // },
        data.push({
          id: column.name as string,
          label: `${column.aggregate}(${column.alias as string})`,
          type: 'string',
          operators: ['equal', 'less', 'greater'],
        });
      } else {
        data.push({
          id: column.name as string,
          label: column.alias as string,
          type: 'string',
          operators: ['equal', 'less', 'greater'],
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
    console.log(rules);
    const aggregateColumns = getAggregateColumns();
    options.having = parseHavingQuery(
      {},
      rules.condition,
      rules,
      aggregateColumns,
    ) as AdvancedQueryHaving;
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  const onReset = () => {
    jqBuilder?.reset();
  };

  const hasAggregate = (columns: AdvancedQueryColumn[]) => {
    const aggregateColumns = columns?.find((column: AdvancedQueryColumn) => column.aggregate);
    if (aggregateColumns) return true;

    return false;
  };

  return (
    <>
      {(options.groupby as string[])?.length > 0 ||
      hasAggregate(options.columns as AdvancedQueryColumn[]) ? (
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
              Replace
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
      ) : (
        <Alert variant="warning" className="mt-2">
          Having clause requires groupBy or aggregate columns
        </Alert>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
