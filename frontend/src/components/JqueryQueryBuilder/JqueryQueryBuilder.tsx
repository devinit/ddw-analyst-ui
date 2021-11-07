import React, { FunctionComponent, useEffect } from 'react';
import 'jQuery-QueryBuilder/dist/css/query-builder.default.min.css';
import './jQueryQueryBuilder.css';
import * as jQueryQueryBuilder from 'jQuery-QueryBuilder';
import {
  JqueryQueryBuilderFieldData,
  JqueryQueryBuilderIcons,
  JqueryQueryBuilderFilter,
} from '../../types/operations';

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
      filters: fieldData,
      icons,
    });

    jq.init();

    if (Object.keys(rules).length > 0) {
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
