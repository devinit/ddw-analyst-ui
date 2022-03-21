import React, { FunctionComponent, useContext, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../types/operations';
import { Column, ColumnList, SourceMap } from '../../types/sources';
import { Field, NameLabelPair, RuleGroupType } from 'react-querybuilder';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import {
  createQueryBuilderRules,
  getAggregateColumns,
  getGroupByColumns,
  isNumeric,
  parseHavingQueryReact,
} from './utils';
import { ReactQueryBuilder } from '../ReactQueryBuilder';

interface ComponentProps {
  source: SourceMap;
}
export const aggregateOptions = ['AVG', 'SUM', 'MAX', 'MIN', 'STD'];

const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [error, setError] = useState('');
  const operators = [
    { name: '$eq', label: '=' },
    { name: '$neq', label: '!=' },
    { name: '$lt', label: '<' },
    { name: '$gt', label: '>' },
    { name: '$le', label: '<=' },
    { name: '$gte', label: '>=' },
  ];

  const [query, setQuery] = useState<RuleGroupType>(
    options.having
      ? createQueryBuilderRules({}, options.having)
      : { id: 'root', combinator: 'and', rules: [] },
  );

  const getDropdownOptionsForAggregateColumn = (
    aggregateOptions: string[],
    column: AdvancedQueryColumn,
  ): NameLabelPair[] =>
    aggregateOptions.map((option) => ({
      name: `${column.name},${option}`,
      label: `${option}(${column.alias})`,
    }));

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

  const onQueryChange = (query: RuleGroupType) => {
    setQuery(query);
    const aggregateColumns = getAggregateColumns(options.columns);
    const columns = getGroupByColumns(options);
    options.having = parseHavingQueryReact({}, query.combinator, query, aggregateColumns, columns);
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  return (
    <div>
      <Alert variant="warning" show={!!error}>
        {error}
      </Alert>
      <ReactQueryBuilder query={query} fields={fields()} onQueryChange={(q) => onQueryChange(q)} />
    </div>
  );
};
export { AdvancedHavingQueryBuilder };
