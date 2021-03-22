import React, { FunctionComponent } from 'react';
import { OperationMap } from '../../types/operations';
import { Source } from '../../types/sources';

type ComponentProps = {
  operation?: OperationMap;
  sources: Source[];
};

const QueryBuilderContainer: FunctionComponent<ComponentProps> = (props) => {
  console.log(props);

  return <div>Content Goes Here</div>;
};

const QueryBuilderContainerMemo = React.memo(QueryBuilderContainer);

export { QueryBuilderContainerMemo as QueryBuilderContainer };
