import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { AdvancedQueryOptions } from '../../types/operations';
import { Field, RuleGroupType } from 'react-querybuilder';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { createQueryBuilderRules, getAggregateColumns, parseHavingQuery } from './utils';
import { ReactQueryBuilder } from '../ReactQueryBuilder';

export const aggregateOptions = ['AVG', 'SUM', 'MAX', 'MIN', 'STD'];

const AdvancedHavingQueryBuilder: FunctionComponent = () => {
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

  useEffect(() => {
    if (!options.groupby) {
      setError('Requires a groupBy clause');
    }
  }, [options.groupby?.length]);

  const fields = () => {
    const data: Field[] = [];
    const columns = getAggregateColumns(options.columns);
    columns.map((column) => {
      data.push({
        name: column.name as string,
        label: `${column.aggregate}(${column.alias as string})`,
        operators,
      });
    });

    return data;
  };

  const onQueryChange = (query: RuleGroupType) => {
    setQuery(query);
    const aggregateColumns = getAggregateColumns(options.columns);
    options.having = parseHavingQuery({}, query.combinator, query, aggregateColumns);
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
