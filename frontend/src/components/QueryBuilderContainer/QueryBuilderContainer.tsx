import React, { FunctionComponent } from 'react';
import { OperationMap } from '../../types/operations';
import { Source } from '../../types/sources';
import { getSourceIDFromOperation } from '../../utils';

type ComponentProps = {
  operation?: OperationMap;
  sources: Source[];
};

const QueryBuilderContainer: FunctionComponent<ComponentProps> = (props) => {
  const activeSourceID = props.operation && getSourceIDFromOperation(props.operation);
  const activeSource =
    typeof activeSourceID === 'number'
      ? props.sources.find((source) => activeSourceID === source.id)
      : undefined;

  console.log(activeSource);

  return <div>Content Goes Here</div>;
};

const QueryBuilderContainerMemo = React.memo(QueryBuilderContainer);

export { QueryBuilderContainerMemo as QueryBuilderContainer };
