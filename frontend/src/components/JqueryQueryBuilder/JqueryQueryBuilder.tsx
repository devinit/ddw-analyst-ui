import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import React, { FunctionComponent, useEffect } from 'react';
import {
  JqueryQueryBuilderFieldData,
  JqueryQueryBuilderFilter,
  JqueryQueryBuilderIcons,
} from '../../types/operations';
import { aggregateOptions } from '../AdvancedHavingQueryBuilder';
import { sortAggregateOptions } from '../AdvancedHavingQueryBuilder/utils';
import './jqueryQueryBuilder.css';

export interface JqueryQueryBuilderProps {
  fieldData: JqueryQueryBuilderFieldData[];
  getJqueryBuilderInstance: (jqInstance: any) => void;
  icons?: JqueryQueryBuilderIcons;
  rules: JqueryQueryBuilderFilter;
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
      if (Object.prototype.toString.call(rules?.rules[0].value) === '[object Object]') {
        console.log(rules);
        if ('plain' in rules.rules[0].value) {
          rules.rules[0].value = rules.rules[0].value['plain'];
        }
        const previousValue = rules.rules[0].value;
        rules.rules[0].value = rules.rules[0]['values'];
        delete rules.rules[0].value;
        rules.rules[0].values = sortAggregateOptions(aggregateOptions, previousValue.aggregate).map(
          (option) => {
            return {
              value: `${previousValue.column},${option}`,
              label: `${option}(${previousValue.column})`,
            };
          },
        );
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
