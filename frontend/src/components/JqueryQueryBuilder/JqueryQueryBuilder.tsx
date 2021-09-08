import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import './jQueryQueryBuilder.css';
import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { AdvancedQueryOptions } from '../../types/operations';
import { parseQueryBuilderRules } from './utils';

interface JqueryQueryBuilder {
  show?: boolean;
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

const JqueryQueryBuilder: FunctionComponent<JqueryQueryBuilder> = () => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});
  const rules_basic = {
    condition: 'AND',
    rules: [
      {
        id: 'price',
        operator: 'less',
        value: 10.25,
      },
      {
        condition: 'OR',
        rules: [
          {
            id: 'category',
            operator: 'equal',
            value: 2,
          },
          {
            id: 'category',
            operator: 'equal',
            value: 1,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    const jq = new jQueryQueryBuilder((window as any).$('#builder'), {
      filters: [
        {
          id: 'name',
          label: 'Name',
          type: 'string',
        },
        {
          id: 'category',
          label: 'Category',
          type: 'integer',
          input: 'select',
          values: {
            1: 'Books',
            2: 'Movies',
            3: 'Music',
            4: 'Tools',
            5: 'Goodies',
            6: 'Clothes',
          },
          operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null'],
        },
        {
          id: 'in_stock',
          label: 'In stock',
          type: 'integer',
          input: 'radio',
          values: {
            1: 'Yes',
            0: 'No',
          },
          operators: ['equal'],
        },
        {
          id: 'price',
          label: 'Price',
          type: 'double',
          validation: {
            min: 0,
            step: 0.01,
          },
        },
        {
          id: 'id',
          label: 'Identifier',
          type: 'string',
          placeholder: '____-____-____',
          operators: ['equal', 'not_equal'],
          validation: {
            format: /^.{4}-.{4}-.{4}$/,
          },
        },
      ],
      icons: {
        add_group: 'fa fa-plus-circle',
        add_rule: 'fa fa-plus',
        remove_group: 'fa fa-times realign',
        remove_rule: 'fa fa-times realign',
        error: 'fa fa-exclamation-triangle',
      },
      rules: rules_basic,
    });

    jq.init(rules_basic);

    setJqBuilder(jq);

    // (window as any).$('#btn-set').on('click', function () {
    //   (window as any).$('#builder-basic').queryBuilder('setRules', rules_basic);
    // });

    // const result = (window as any).$('#builder-basic').queryBuilder('getRules');
    // (window as any).$('#btn-get').on('click', function () {
    //   if (!(window as any).$.isEmptyObject(result)) {
    //     alert(JSON.stringify(result, null, 2));
    //   }
    // });
  }, []);

  const onReset = () => {
    jqBuilder?.reset();
  };

  const onReplace = () => {
    const result = jqBuilder?.getRules();

    const tru = parseQueryBuilderRules(result.rules, {}, result.condition);
    alert(JSON.stringify(tru, null, 2));
    options.filter = result;
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
