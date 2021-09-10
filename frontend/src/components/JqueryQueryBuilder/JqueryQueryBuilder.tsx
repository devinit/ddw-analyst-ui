import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import './jQueryQueryBuilder.css';
import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { AdvancedQueryOptions } from '../../types/operations';
import { parseQuery } from './utils';
import { SourceMap } from '../../types/sources';
import { getColumnGroupOptionsFromSource } from '../AdvancedSelectQueryBuilder/ColumnSelector/utils';

interface JqueryQueryBuilder {
  show?: boolean;
  source: SourceMap;
}

export type QueryBuilderRules = {
  condition?: 'AND' | 'OR';
  rules?: (QueryBuilderRulesComparator | QueryBuilderRules)[];
};

export type QueryBuilderRulesComparator = {
  id: string;
  field: string;
  type: string;
  input: string;
  operator: string;
  value: string | number;
};

const JqueryQueryBuilder: FunctionComponent<JqueryQueryBuilder> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  useEffect(() => {
    const jq = new jQueryQueryBuilder((window as any).$('#builder'), {
      filters: getColumnGroupOptionsFromSource(source).map((column) => {
        return {
          id: column.value,
          label: column.text,
          type: 'string',
          operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal'],
        };
      }),
      icons: {
        add_group: 'fa fa-plus-circle',
        add_rule: 'fa fa-plus',
        remove_group: 'fa fa-times realign',
        remove_rule: 'fa fa-times realign',
        error: 'fa fa-exclamation-triangle',
      },
    });

    jq.init();

    setJqBuilder(jq);
  }, [source]);

  const onReset = () => {
    jqBuilder?.reset();
  };

  const onReplace = () => {
    const rules = jqBuilder?.getRules();
    options.filter = parseQuery({}, rules.condition, rules);
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  return (
    <>
      <div className="mb-3">
        <div id="builder" />
      </div>
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
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="bottom"
          data-html="true"
          title={`<i>Inserts</i> config to current cursor position on the main editor. </br> <strong>NB:</strong> valid JSON will auto-format`}
          // onClick={() => onUpdate('insert')}
        >
          Insert
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
};

export { JqueryQueryBuilder };
