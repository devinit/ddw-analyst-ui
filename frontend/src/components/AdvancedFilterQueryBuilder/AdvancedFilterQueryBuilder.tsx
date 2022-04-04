import React, { FunctionComponent, useContext, useState } from 'react';
import { Field, RuleGroupType } from 'react-querybuilder';
import { AdvancedQueryOptions } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { getColumnGroupOptionsFromSource } from '../AdvancedSelectQueryBuilder/ColumnSelector/utils';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { ReactQueryBuilder } from '../ReactQueryBuilder';
import { createQueryBuilderRules, parseQuery } from './utils/actions';

interface ComponentProps {
  source: SourceMap;
}

export type FilterWith = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [query, setQuery] = useState<RuleGroupType>(
    options.filter
      ? createQueryBuilderRules({}, options.filter)
      : { id: 'root', combinator: 'and', rules: [] },
  );
  const operators = [
    { name: '$eq', label: '=' },
    { name: '$neq', label: '!=' },
    { name: '$lt', label: '<' },
    { name: '$gt', label: '>' },
    { name: '$le', label: '<=' },
    { name: '$gte', label: '>=' },
    { name: '$text_search', label: 'contains' },
  ];

  const fields: Field[] = getColumnGroupOptionsFromSource(source).map((column) => {
    return {
      name: column.value as string,
      label: column.text,
      operators,
    };
  });

  const onQueryChange = (query: RuleGroupType) => {
    setQuery(query);
    options.filter = parseQuery({}, query.combinator, query);
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  return (
    <>
      <ReactQueryBuilder query={query} fields={fields} onQueryChange={(q) => onQueryChange(q)} />
    </>
  );
};

export { AdvancedFilterQueryBuilder };
