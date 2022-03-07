import React, { FunctionComponent, useContext, useState } from 'react';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import {
  AdvancedQueryColumn,
  AdvancedQueryHaving,
  AdvancedQueryOptions,
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderHavingComparator,
} from '../../types/operations';
import { Column, ColumnList, SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { createQueryBuilderRules, parseHavingQuery } from '../JqueryQueryBuilder/utils';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
}
export const aggregateOptions = ['AVG', 'SUM', 'MAX', 'MIN', 'STD'];
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  const getGroupColumns = () =>
    options.columns?.filter((col) => options.groupby?.includes(col.name as string));

  const getNumericColumns = () => {
    const sourceColumns: Column[] = (source?.get('columns') as ColumnList).toJS() as Column[];

    return (getGroupColumns() as AdvancedQueryColumn[])
      .filter((column) => {
        const matchingColumn = sourceColumns.find((col) => col.name === column.name);

        return matchingColumn && matchingColumn.data_type === 'N';
      })
      .map((col) => ({
        id: col.id as number,
        alias: col.alias as string,
        name: col.name as string,
      }));
  };

  const isNumeric = (column: AdvancedQueryColumn) => {
    if (getNumericColumns()?.find((col) => col.name === column.name)) {
      return true;
    }

    return false;
  };

  const getAggregateColumns = () => options.columns?.filter((column) => column.aggregate);

  const getColumns = () => {
    const groupColumns = getGroupColumns();
    const aggregateColumns = getAggregateColumns();

    return groupColumns?.concat(aggregateColumns as AdvancedQueryColumn);
  };

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
    (getColumns() as AdvancedQueryColumn[])?.map((column) => {
      if (column.aggregate) {
        data.push({
          id: column.name as string,
          label: `${column.aggregate}(${column.alias as string})`,
          type: 'string',
          operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
        });
      } else if (isNumeric(column) && !column.aggregate) {
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
    const aggregateColumns = getAggregateColumns();
    const columns = getGroupColumns();
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

  const hasAggregate = (columns: AdvancedQueryColumn[]) => {
    const aggregateColumns = columns?.find((column: AdvancedQueryColumn) => column.aggregate);
    if (aggregateColumns) return true;

    return false;
  };
  const getHavingQueryValues = (rules) => {
    rules.rules?.map((_rule, index) => {
      const element = (
        (rules as JqueryQueryBuilderHaving)['rules'] as JqueryQueryBuilderHavingComparator[]
      )[index];
      if ('plain' in (element.value as { plain: string | number })) {
        element.value = (element.value as { plain: string | number })['plain'];
      } else {
        const activeValue: { column: string; aggregate: string } = element.value as {
          column: string;
          aggregate: string;
        };
        element.value = `${activeValue?.column},${activeValue.aggregate}`;
      }
    });

    return rules;
  };

  return (
    <>
      {(getGroupColumns()?.filter((col) => isNumeric(col)) as AdvancedQueryColumn[])?.length > 0 ||
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
      ) : (
        <Alert variant="warning" className="mt-2">
          Having clause requires groupBy(with numeric values) or aggregate columns
        </Alert>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
