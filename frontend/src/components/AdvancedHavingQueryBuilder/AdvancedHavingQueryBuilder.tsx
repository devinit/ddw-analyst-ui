import React, { FunctionComponent, useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
}
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const { options } = useContext(AdvancedQueryContext);
  const hasAggregate = (columns: AdvancedQueryColumn[]) => {
    const aggregateColumns = columns.find((column: AdvancedQueryColumn) => column.aggregate);
    if (aggregateColumns) return true;

    return false;
  };

  return (
    <>
      {(options.groupby as string[])?.length > 0 ||
      hasAggregate(options.columns as AdvancedQueryColumn[]) ? (
        <div>Having block goes here</div>
      ) : (
        <Alert variant="warning" className="mt-2">
          Having clause requires or aggregate columns
        </Alert>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
