import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import React, { FunctionComponent, useEffect } from 'react';
import {
  AdvancedQueryHaving,
  AdvancedQueryHavingComparator,
  JqueryQueryBuilderFieldData,
  JqueryQueryBuilderFilter,
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderHavingComparator,
  JqueryQueryBuilderIcons,
} from '../../types/operations';
import { aggregateOptions } from '../AdvancedHavingQueryBuilder';
import { sortAggregateOptions } from '../AdvancedHavingQueryBuilder/utils';
import './jqueryQueryBuilder.css';

export interface JqueryQueryBuilderProps {
  fieldData: JqueryQueryBuilderFieldData[];
  getJqueryBuilderInstance: (jqInstance: any) => void;
  icons?: JqueryQueryBuilderIcons;
  rules: JqueryQueryBuilderFilter | JqueryQueryBuilderHaving;
}

const JqueryQueryBuilder: FunctionComponent<JqueryQueryBuilderProps> = ({
  fieldData,
  getJqueryBuilderInstance,
  icons,
  rules,
}) => {
  useEffect(() => {
    const jq = new jQueryQueryBuilder((window as any).$('#builder'), {
      filters: fieldData.sort(function (a, b) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      }),
      icons,
    });

    jq.init();

    if (Object.keys(rules).length > 0) {
      if (
        rules &&
        Object.prototype.toString.call(
          ((rules as JqueryQueryBuilderHaving)['rules'] as JqueryQueryBuilderHavingComparator[])[0]
            .value,
        ) === '[object Object]'
      ) {
        const element = (
          (rules as JqueryQueryBuilderHaving)['rules'] as JqueryQueryBuilderHavingComparator[]
        )[0];
        if (element.value && 'plain' in (element.value as { plain: string | number })) {
          element.value = (element.value as { plain: string | number })['plain'];
        }
        const previousValue: { column: string; aggregate: string } = element.value as {
          column: string;
          aggregate: string;
        };
        delete element.value;
        element.values = sortAggregateOptions(
          aggregateOptions,
          (previousValue as { column: string; aggregate: string }).aggregate,
        ).map((option) => {
          return {
            value: `${previousValue?.column},${option}`,
            label: `${option}(${previousValue?.column})`,
          };
        });
      }
      jq.setRules(rules);
    }

    getJqueryBuilderInstance(jq);
  }, []);

  return (
    <div className="mb-3">
      <div id="builder" />
    </div>
  );
};

export { JqueryQueryBuilder };
