import React, { FunctionComponent, useContext } from 'react';
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
        <div>Having block requires groupby columns</div>
      )}
    </>
  );
};
export { AdvancedHavingQueryBuilder };
