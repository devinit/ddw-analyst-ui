import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import React, { FunctionComponent, useEffect } from 'react';
import {
  JqueryQueryBuilderFieldData,
  JqueryQueryBuilderFilter,
  JqueryQueryBuilderHaving,
  JqueryQueryBuilderIcons,
} from './utils/types';
import './jqueryQueryBuilder.css';

export interface JqueryQueryBuilderProps {
  fieldData: JqueryQueryBuilderFieldData[];
  getJqueryBuilderInstance: (jqInstance: any) => void;
  icons?: JqueryQueryBuilderIcons;
  rules: JqueryQueryBuilderFilter | JqueryQueryBuilderHaving;
  getHavingQueryValues?: (
    rules: JqueryQueryBuilderFilter | JqueryQueryBuilderHaving,
  ) => JqueryQueryBuilderFilter | JqueryQueryBuilderHaving;
}

const JqueryQueryBuilder: FunctionComponent<JqueryQueryBuilderProps> = ({
  fieldData,
  getJqueryBuilderInstance,
  icons,
  rules,
  getHavingQueryValues,
}) => {
  useEffect(() => {
    const jq = new jQueryQueryBuilder((window as any).$('#builder'), {
      filters: fieldData.sort(function (a, b) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      }),
      icons,
    });

    jq.init();

    if (Object.keys(rules).length) {
      if (getHavingQueryValues) {
        rules = getHavingQueryValues(rules);
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
