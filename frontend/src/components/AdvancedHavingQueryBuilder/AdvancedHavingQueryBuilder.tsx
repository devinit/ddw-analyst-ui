import React, { FunctionComponent, useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
}
const AdvancedHavingQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options } = useContext(AdvancedQueryContext);

  return (
    <>
      {(options.groupby as string[])?.length > 0 ? (
        <div>Having block goes here</div>
      ) : (
        <Alert variant="warning" className="mt-2">
          Having close requires groupBy columns
        </Alert>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
