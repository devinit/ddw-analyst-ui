import React, { FunctionComponent, useContext, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Field, RuleGroupType } from 'react-querybuilder';
import { AdvancedQueryOptions } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { getColumnGroupOptionsFromSource } from '../AdvancedSelectQueryBuilder/ColumnSelector/utils';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
// import { createQueryBuilderRules, parseQuery } from '../JqueryQueryBuilder/utils';
import { JqueryQueryBuilderFieldData } from '../JqueryQueryBuilder/utils/types';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { ReactQueryBuilder } from '../ReactQueryBuilder';
import { parseQuery } from './utils/actions';

interface ComponentProps {
  source: SourceMap;
}

export type FilterWith = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  // const fieldData: JqueryQueryBuilderFieldData[] = getColumnGroupOptionsFromSource(source).map(
  //   (column) => {
  //     return {
  //       id: column.value,
  //       label: column.text,
  //       type: 'string',
  //       operators: [
  //         'equal',
  //         'not_equal',
  //         'less',
  //         'less_or_equal',
  //         'greater',
  //         'greater_or_equal',
  //         'contains',
  //       ],
  //     };
  //   },
  // );
  const operators = [
    { name: '$eq', label: '=' },
    { name: '$neq', label: '!=' },
    { name: '$lt', label: '<' },
    { name: '$gt', label: '>' },
    { name: '$le', label: '<=' },
    { name: '$gte', label: '>=' },
    { name: 'contains', label: 'contains' },
  ];

  const fields: Field[] = getColumnGroupOptionsFromSource(source).map((column) => {
    return {
      name: column.value as string,
      label: column.text,
      operators,
    };
  });

  // const getJqueryBuilderInstance = (jqInstance: any) => {
  //   setJqBuilder(jqInstance);
  // };

  // const onReplace = () => {
  //   const rules = jqBuilder?.getRules();
  //   options.filter = parseQuery({}, rules.condition, rules);
  //   if (updateOptions) {
  //     updateOptions(options as AdvancedQueryOptions);
  //   }
  // };

  // const onReset = () => {
  //   jqBuilder?.reset();
  // };
  const onQueryChange = (query: RuleGroupType) => {
    console.log(query);
    options.filter = parseQuery({}, query.combinator, query);
    console.log(options.filter);
  };

  return (
    <>
      {/* <JqueryQueryBuilder
        fieldData={fieldData}
        getJqueryBuilderInstance={getJqueryBuilderInstance}
        icons={{
          add_group: 'fa fa-plus-circle',
          add_rule: 'fa fa-plus',
          remove_group: 'fa fa-times realign',
          remove_rule: 'fa fa-times realign',
          error: 'fa fa-exclamation-triangle',
        }}
        rules={createQueryBuilderRules({}, options.filter)}
      /> */}
      <ReactQueryBuilder fields={fields} onQueryChange={(q) => onQueryChange(q)} />
      {/* <ButtonGroup className="mr-2">
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
      </ButtonGroup> */}
    </>
  );
};

export { AdvancedFilterQueryBuilder };
