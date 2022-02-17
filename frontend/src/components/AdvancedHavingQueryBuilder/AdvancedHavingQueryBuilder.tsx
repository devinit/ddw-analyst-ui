import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { AdvancedQueryColumn, JqueryQueryBuilderFieldData } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { createQueryBuilderRules } from '../JqueryQueryBuilder/utils';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
}
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const { options } = useContext(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  const getGroupColumns = () =>
    options.columns?.filter((col) => options.groupby?.includes(col.name as string));

  const getColumns = () => {
    if (options.groupby) {
      const groupColumns = getGroupColumns();

      return groupColumns;
    }
  };

  const fieldData: JqueryQueryBuilderFieldData[] = (getColumns() as AdvancedQueryColumn[]).map(
    (column) => {
      return {
        id: column.name as string,
        label: column.alias as string,
        type: 'string',
        operators: ['equal', 'less', 'greater'],
      };
    },
  );

  const getJqueryBuilderInstance = (jqInstance: any) => {
    setJqBuilder(jqInstance);
  };
  // const getAggregateColumns = () => options.columns?.filter((column) => column.aggregate);

  const hasAggregate = (columns: AdvancedQueryColumn[]) => {
    const aggregateColumns = columns?.find((column: AdvancedQueryColumn) => column.aggregate);
    if (aggregateColumns) return true;

    return false;
  };

  return (
    <>
      {(options.groupby as string[])?.length > 0 ||
      hasAggregate(options.columns as AdvancedQueryColumn[]) ? (
        <JqueryQueryBuilder
          fieldData={fieldData}
          getJqueryBuilderInstance={getJqueryBuilderInstance}
          icons={{
            add_group: 'fa fa-plus-circle',
            add_rule: 'fa fa-plus',
            remove_group: 'fa fa-times realign',
            remove_rule: 'fa fa-times realign',
            error: 'fa fa-exclamation-triangle',
          }}
          rules={createQueryBuilderRules({}, options.having)}
        />
      ) : (
        <Alert variant="warning" className="mt-2">
          Having clause requires groupBy or aggregate columns
        </Alert>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
